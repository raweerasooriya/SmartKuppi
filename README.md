# SmartKuppi Learning Platform

A comprehensive learning resource sharing and online class scheduling platform for university students.

## 📋 Project Overview

SmartKuppi bridges the gap between peer resource sharing and online class scheduling, providing a centralized hub for university students.

### 👥 Team WD_81_3.2
- **Rashaan** - User Management & Security (Module 1)
- **Oditha** - Learning Resource Sharing (Module 2)
- **Subashanth** - Lesson Scheduling & Classes (Module 3)
- **Dilhani** - Announcements & Discussion (Module 4)

## 🏗️ Tech Stack

### Frontend
- React.js
- Tailwind CSS
- React Router DOM
- Lucide Icons

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt

## 📁 Project Structure
smartkuppi-platform/
├── frontend/ # React frontend application
└── backend/ # Node.js backend API


## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
git clone https://github.com/raweerasooriya/SmartKuppi.git
cd SmartKuppi

2. Install Backend Dependencies
cd backend
npm install

3. Configure Backend Environment
cp .env.example .env
# Edit .env with your configuration

4. Install Frontend Dependencies
cd ../frontend
npm install

5. Configure Frontend Environment
# Create frontend/.env file
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

Running the Application

1. Start Backend Server
cd backend
npm run dev

2. Start Frontend Development Server
cd frontend
npm start

3. Access the application

Frontend: http://localhost:3000

Backend API: http://localhost:5000

📚 API Documentation
Authentication Routes
POST /api/auth/register - Register new user

POST /api/auth/login - Login user

Admin Routes
GET /api/admin/users - Get all users

PUT /api/admin/users/:id/status - Update user status

Tutor Routes
POST /api/tutor/courses - Create course

PUT /api/tutor/sessions/:id - Update session

Student Routes
GET /api/student/courses - View enrolled courses

POST /api/student/sessions/:id/join - Join session

🔐 Environment Variables
Backend (.env)
PORT=5000
MONGO_URI=mongodb://localhost:27017/smartkuppi
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

Frontend (.env)
REACT_APP_API_URL=http://localhost:5000/api

🤝 Contributing
Each team member should work on their respective module branches:

module-1-user-management - Rashaan

module-2-resource-sharing - Oditha

module-3-lesson-scheduling - Subashanth

module-4-announcements - Dilhani

📝 License
This project is created for educational purposes as part of the module assignment.

🙏 Acknowledgments
SLIIT for the project opportunity

Module lecturers and instructors

