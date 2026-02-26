import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, MessageCircle, Users, Star, TrendingUp, Shield, Award } from 'lucide-react';

// Import your hero image
import heroImage from '../assets/images/hero-image.png'; // Adjust path and filename as needed

const Home = () => {
  const features = [
    {
      icon: <BookOpen className="h-8 w-8 text-blue-600" />,
      title: "Learning Resources",
      description: "Access study materials, PDFs, and external links shared by tutors and peers.",
      module: "Module 2",
      developedBy: "Oditha"
    },
    {
      icon: <Calendar className="h-8 w-8 text-blue-600" />,
      title: "Lesson Scheduling",
      description: "Schedule and join online classes with Zoom/Google Meet integration.",
      module: "Module 3",
      developedBy: "Subashanth"
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-blue-600" />,
      title: "Announcements & Discussions",
      description: "Stay updated with announcements and engage in lesson discussions.",
      module: "Module 4",
      developedBy: "Dilhani"
    },
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "User Management",
      description: "Secure role-based access for Students, Tutors, and Admins.",
      module: "Module 1",
      developedBy: "Rashaan"
    }
  ];

  const stats = [
    { icon: <Users />, value: "500+", label: "Active Students" },
    { icon: <BookOpen />, value: "1000+", label: "Learning Resources" },
    { icon: <Calendar />, value: "50+", label: "Weekly Lessons" },
    { icon: <Star />, value: "4.8/5", label: "Student Rating" }
  ];

  const trendingResources = [
    { title: "Advanced JavaScript Guide", type: "PDF", author: "Dr. Smith", rating: 4.9, likes: 234 },
    { title: "React Basics Tutorial", type: "Video", author: "Prof. Johnson", rating: 4.8, likes: 189 },
    { title: "Data Structures Notes", type: "PDF", author: "Dr. Williams", rating: 4.7, likes: 156 }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Image */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Welcome to <span className="text-yellow-300">SmartKuppi</span>
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Your centralized hub for resource sharing and online classes. 
                Bridging the gap between peer learning and academic success.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg hover:shadow-xl">
                  Get Started
                </Link>
                <Link to="/resources" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition">
                  Explore Resources
                </Link>
              </div>
            </div>
            
            {/* Image Section - Updated with your image */}
            <div className="hidden lg:block relative">
              <div className="relative rounded-lg overflow-hidden shadow-2xl">
                <img 
                  src={heroImage} 
                  alt="SmartKuppi Platform - Learning Resource Sharing and Online Classes"
                  className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                />
                {/* Optional overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent"></div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-400 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-400 rounded-full opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center text-blue-600 mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold text-gray-800">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Our Modules</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Built with four independent modules for efficient full-stack development
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 mb-3">{feature.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-600 font-medium">{feature.module}</span>
                      <span className="text-gray-500">Developed by: {feature.developedBy}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Resources Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Trending Now 🔥</h2>
            <Link to="/resources" className="text-blue-600 hover:text-blue-700 font-medium">
              View All →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trendingResources.map((resource, index) => (
              <div key={index} className="border rounded-lg p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-blue-100 text-blue-600 text-sm px-3 py-1 rounded-full">
                    {resource.type}
                  </span>
                  <div className="flex items-center text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="ml-1 text-gray-600">{resource.rating}</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{resource.title}</h3>
                <p className="text-gray-600 text-sm mb-3">by {resource.author}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-500 text-sm">
                    <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                    <span>{resource.likes} likes</span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Learning?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students and tutors on SmartKuppi today.
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg hover:shadow-xl"
          >
            Sign Up Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;