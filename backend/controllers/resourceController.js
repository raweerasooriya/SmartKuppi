const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Resource = require('../models/Resource');
const Course = require('../models/Course');
const AuditLog = require('../models/AuditLog');
const { logAudit } = require('../middleware/auditMiddleware');
const sharp = require('sharp'); // Add at the top
const pdf = require('pdf-poppler'); // Add at the top

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
exports.uploadResourceFile = upload.single('file');

// @desc    Upload a resource file and create resource record
// @route   POST /api/courses/:courseId/resources
// @access  Private (Tutor of the course)
exports.createResource = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, fileType, tags } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (course.tutor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const fileUrl = `/uploads/${req.file.filename}`;
    let previewUrl = null;
    if (req.file) {
      if (req.file.mimetype.startsWith('image/')) {
        // If the file is an image, generate a thumbnail
        const thumbFilename = 'thumb_' + req.file.filename;
        const thumbPath = path.join(uploadDir, thumbFilename);
        await sharp(req.file.path)
          .resize(200, 200, { fit: 'inside' })
          .toFile(thumbPath);
        previewUrl = `/uploads/${thumbFilename}`;
      } else if (req.file.mimetype === 'application/pdf') {
        // Generate PDF thumbnail
        const pdfPath = req.file.path;
        const outputPath = path.join(uploadDir, 'thumb_' + req.file.filename + '.jpg');
        const opts = {
          format: 'jpeg',
          out_dir: uploadDir,
          out_prefix: 'thumb_' + req.file.filename,
          page: 1
        };
        await pdf.convert(pdfPath, opts);
        previewUrl = `/uploads/thumb_${req.file.filename}1.jpg`; // pdf-poppler appends page number
      }
    }

    const resource = await Resource.create({
      title: title || req.file.originalname,
      description: description || '',
      fileUrl,
      fileType: fileType || 'other',
      course: courseId,
      uploadedBy: req.user.id,
      previewUrl, // Save the preview URL
      tags: Array.isArray(tags) ? tags : (typeof tags === 'string' && tags.length > 0 ? tags.split(',').map(t => t.trim()) : [])
    });

    await logAudit({
      userId: req.user.id, userName: req.user.name, userEmail: req.user.email, userRole: req.user.role,
      action: 'UPLOAD_RESOURCE', entity: 'Resource', entityId: resource._id,
      details: { title: resource.title, courseId, fileType: resource.fileType, fileSize: req.file.size },
      req
    });

    res.status(201).json({ success: true, data: resource });
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all resources for a course
// @route   GET /api/courses/:courseId/resources
// @access  Private (if enrolled or tutor)
exports.getCourseResources = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    let canView = false;
    if (course.status === 'published') canView = true;
    if (req.user && (req.user.id === course.tutor.toString() || req.user.role === 'admin')) canView = true;
    if (req.user && req.user.role === 'student') {
      const Enrollment = require('../models/Enrollment');
      const enrolled = await Enrollment.findOne({ student: req.user.id, course: courseId, status: 'active' });
      if (enrolled) canView = true;
    }
    if (!canView) return res.status(403).json({ success: false, message: 'Not authorized' });

    // Tag filtering
    const tag = req.query.tag;
    let filter = { course: courseId };
    if (tag) filter.tags = tag;
    const resources = await Resource.find(filter).sort('-createdAt');
    res.json({ success: true, data: resources });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a resource (and remove file from disk)
// @route   DELETE /api/resources/:id
// @access  Private (Tutor of the course)
exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate('course');
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    if (resource.course.tutor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await logAudit({
      userId: req.user.id, userName: req.user.name, userEmail: req.user.email, userRole: req.user.role,
      action: 'DELETE_RESOURCE', entity: 'Resource', entityId: resource._id,
      details: { title: resource.title, courseId: resource.course._id },
      req
    });

    const filePath = path.join(uploadDir, path.basename(resource.fileUrl));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await resource.deleteOne();

    res.json({ success: true, message: 'Resource deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Increment download count
// @route   PUT /api/resources/:id/download
// @access  Private
exports.incrementDownload = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    resource.downloads += 1;
    await resource.save();

    // Audit log for resource download
    await logAudit({
      userId: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'DOWNLOAD_RESOURCE',
      entity: 'Resource',
      entityId: resource._id,
      details: { title: resource.title, courseId: resource.course },
      req
    });

    res.json({ success: true, downloads: resource.downloads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};