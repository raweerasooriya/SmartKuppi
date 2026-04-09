// src/components/AnnouncementManager.js
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, BookOpen, Calendar, CheckCircle, ChevronLeft, Edit3, Send, Trash2, X } from 'lucide-react';

const countLetters = (value) => (value || '').replace(/[^A-Za-z]/g, '').length;

const createEmptyForm = (allowCommon) => ({
    title: '',
    content: '',
    audience: allowCommon ? 'common' : 'module',
    courseId: ''
});

const validateAnnouncement = (formData, allowCommon) => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    else if (countLetters(formData.title.trim()) < 3) errors.title = 'Title must contain at least 3 letters';

    if (!formData.content.trim()) errors.content = 'Content is required';
    else if (formData.content.trim().length < 10) errors.content = 'Content must be at least 10 characters';

    if (formData.audience === 'module' && !formData.courseId) errors.courseId = 'Select a course/module';
    return errors;
};

const AnnouncementManager = ({
    pageTitle, pageDescription, announcements = [], loading = false,
    allowCreate = false, allowCommon = false, courseOptions = [],
    currentUserId, currentUserRole, emptyText = 'No announcements found.',
    onBack, onRefresh, onCreateAnnouncement, onUpdateAnnouncement, onDeleteAnnouncement
}) => {
    const [createForm, setCreateForm] = useState(createEmptyForm(allowCommon));
    const [createErrors, setCreateErrors] = useState({});
    const [createSubmitting, setCreateSubmitting] = useState(false);
    
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);
    const [editForm, setEditForm] = useState(createEmptyForm(allowCommon));
    const [editErrors, setEditErrors] = useState({});
    const [editSubmitting, setEditSubmitting] = useState(false);

    // FIX 1: Post Button Logic
    const handleCreateSubmit = async (event) => {
        event.preventDefault();
        const errors = validateAnnouncement(createForm, allowCommon);
        setCreateErrors(errors);
        if (Object.keys(errors).length > 0) return;

        setCreateSubmitting(true);
        try {
            const response = await onCreateAnnouncement({
                title: createForm.title.trim(),
                content: createForm.content.trim(),
                audience: createForm.audience,
                course: createForm.audience === 'module' ? createForm.courseId : null 
            });

            // Check if the response from the dashboard function indicates success
            if (response && response.success === false) {
                throw new Error(response.message || 'Failed to post');
            }
            
            setCreateForm(createEmptyForm(allowCommon));
            setCreateErrors({});
            if (onRefresh) await onRefresh(); 
            
        } catch (error) {
            // This will now catch backend errors and show them in the UI
            setCreateErrors({ submit: error.message || 'Failed to create announcement' });
        } finally {
            setCreateSubmitting(false);
        }
    };

    // FIX 2: Edit Submit Logic
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        const errors = validateAnnouncement(editForm, allowCommon);
        if (Object.keys(errors).length > 0) { setEditErrors(errors); return; }
        
        setEditSubmitting(true);
        try {
            await onUpdateAnnouncement(editingAnnouncement._id, { 
                title: editForm.title.trim(),
                content: editForm.content.trim(),
                audience: editForm.audience,
                course: editForm.audience === 'module' ? editForm.courseId : null 
            });
            setEditingAnnouncement(null);
            if (onRefresh) onRefresh();
        } catch (err) { 
            setEditErrors({ submit: err.message }); 
        } finally { 
            setEditSubmitting(false); 
        }
    };

    // Helper to check if current user can manage a specific announcement
    const canManage = (ann) => {
        if (currentUserRole === 'admin') return true; // Admins can manage everything
        return String(ann.createdBy?._id || ann.createdBy) === String(currentUserId);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="flex items-center gap-4">
                {onBack && <button onClick={onBack} className="p-2 hover:bg-white border rounded-xl"><ChevronLeft className="h-5 w-5" /></button>}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{pageTitle}</h1>
                    <p className="text-slate-500">{pageDescription}</p>
                </div>
            </div>

            {allowCreate && (
                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                    <h2 className="text-lg font-bold mb-4">Create Announcement</h2>
                    <form onSubmit={handleCreateSubmit} className="space-y-4">
                        <input type="text" placeholder="Title" value={createForm.title} onChange={e => setCreateForm({...createForm, title: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl outline-none" />
                        {createErrors.title && <p className="text-rose-500 text-xs font-bold">{createErrors.title}</p>}
                        
                        <textarea rows={3} placeholder="Content..." value={createForm.content} onChange={e => setCreateForm({...createForm, content: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl outline-none resize-none" />
                        {createErrors.content && <p className="text-rose-500 text-xs font-bold">{createErrors.content}</p>}

                        <div className="flex flex-wrap gap-4">
                            {allowCommon && (
                                <select value={createForm.audience} onChange={e => setCreateForm({...createForm, audience: e.target.value})} className="px-4 py-2 bg-slate-50 rounded-lg border">
                                    <option value="common">Common (All Students)</option>
                                    <option value="module">Module Specific</option>
                                </select>
                            )}
                            {createForm.audience === 'module' && (
                                <select value={createForm.courseId} onChange={e => setCreateForm({...createForm, courseId: e.target.value})} className="px-4 py-2 bg-slate-50 rounded-lg border">
                                    <option value="">Select Course</option>
                                    {courseOptions.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                                </select>
                            )}
                            <button type="submit" disabled={createSubmitting} className="ml-auto bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2">
                                {createSubmitting ? "Sending..." : <><Send size={18}/> Post</>}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-10">
                        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" />
                    </div>
                ) : announcements.length === 0 ? (
                    <p className="text-center text-slate-400 py-10">{emptyText}</p>
                ) : (
                    announcements.map((ann) => {
                        // Permission Logic
                        const isOwner = String(ann.createdBy?._id || ann.createdBy) === String(currentUserId);
                        const isAdmin = currentUserRole === 'admin';

                        // Logic: Owner can edit. Owner OR Admin can delete.
                        const canEdit = isOwner;
                        const canDelete = isOwner || isAdmin;

                        return (
                            <div key={ann._id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative group">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full">
                                        {ann.audience === 'common' ? 'Global' : 'Module'}
                                    </span>
                                    {ann.course && (
                                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                                            {ann.course.title}
                                        </span>
                                    )}
                                    <span className="text-[10px] font-bold text-slate-400">
                                        {new Date(ann.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-slate-900">{ann.title}</h3>
                                <p className="text-slate-600 mt-2 whitespace-pre-line">{ann.content}</p>

                                <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                                    <span className="text-xs text-slate-400 font-medium">
                                        By {ann.createdBy?.name || 'Staff'} ({ann.createdByRole})
                                    </span>

                                    <div className="flex gap-2">
                                        {/* EDIT BUTTON: Only for the person who wrote it */}
                                        {canEdit && (
                                            <button
                                                onClick={() => {
                                                    setEditingAnnouncement(ann);
                                                    setEditForm({
                                                        title: ann.title,
                                                        content: ann.content,
                                                        audience: ann.audience,
                                                        courseId: ann.course?._id || '',
                                                    });
                                                }}
                                                className="p-2 hover:bg-indigo-50 rounded-lg text-indigo-600 transition-colors"
                                                title="Edit Post"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                        )}

                                        {/* DELETE BUTTON: For the owner OR the Admin */}
                                        {canDelete && (
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Permanently delete this announcement?')) {
                                                        onDeleteAnnouncement(ann._id);
                                                    }
                                                }}
                                                className="p-2 hover:bg-rose-50 rounded-lg text-rose-500 transition-colors"
                                                title="Delete Post"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* FIX 4: Added the actual Edit Modal JSX */}
            <AnimatePresence>
                {editingAnnouncement && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
                            <div className="bg-indigo-600 p-6 flex justify-between items-center text-white">
                                <h2 className="text-xl font-bold">Edit Announcement</h2>
                                <button onClick={() => setEditingAnnouncement(null)}><X /></button>
                            </div>
                            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                                <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border rounded-xl outline-none" />
                                <textarea rows={5} value={editForm.content} onChange={e => setEditForm({...editForm, content: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border rounded-xl outline-none resize-none" />
                                
                                <div className="flex justify-end gap-3">
                                    <button type="button" onClick={() => setEditingAnnouncement(null)} className="px-6 py-2 border rounded-xl font-bold">Cancel</button>
                                    <button type="submit" disabled={editSubmitting} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold">
                                        {editSubmitting ? "Saving..." : "Update Announcement"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AnnouncementManager;