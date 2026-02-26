import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-400" />
              <span className="font-bold text-xl">Smart<span className="text-blue-400">Kuppi</span></span>
            </Link>
            <p className="text-gray-400 text-sm">
              Bridging the gap between peer resource sharing and online class scheduling for university students.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/resources" className="text-gray-400 hover:text-blue-400 transition">Resources</Link></li>
              <li><Link to="/lessons" className="text-gray-400 hover:text-blue-400 transition">Lessons</Link></li>
              <li><Link to="/announcements" className="text-gray-400 hover:text-blue-400 transition">Announcements</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-blue-400 transition">About Us</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/faq" className="text-gray-400 hover:text-blue-400 transition">FAQ</Link></li>
              <li><Link to="/help" className="text-gray-400 hover:text-blue-400 transition">Help Center</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-blue-400 transition">Contact Us</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-blue-400 transition">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">support@smartkuppi.com</span>
              </li>
              <li className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">+94 11 234 5678</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">Colombo, Sri Lanka</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} SmartKuppi. All rights reserved. | Presented by WD_81_3.2
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;