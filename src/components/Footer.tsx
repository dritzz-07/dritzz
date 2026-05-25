import { Phone, Mail, MapPin, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import logoImage from '../assets/images/regenerated_image_1779294281601.png';

export default function Footer() {
  return (
    <footer id="contact" className="bg-black border-t border-white/5 pt-16 pb-8 px-6 md:px-16 text-neutral-300">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
        {/* Brand & Setup */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <Link to="/" className="mb-6 flex items-center gap-3">
            <img src={logoImage} alt="Dritzz Logo" className="w-[60px] h-[60px]" />
            <span className="text-xl font-bold uppercase tracking-widest text-white">Dritzz</span>
          </Link>
          <p className="text-sm text-neutral-400 mb-6 leading-relaxed max-w-sm">
            India's premier smart doorstep car care platform. We simplify vehicle cleaning through technology-driven and customer-friendly services.
          </p>
          <div className="flex gap-4">
             <Link to="/admin" className="text-xs uppercase tracking-wider font-bold text-neutral-500 hover:text-white transition-colors">Admin Login</Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h3 className="text-white text-sm font-bold uppercase tracking-widest mb-6">Company</h3>
          <ul className="space-y-4 text-sm">
            <li><Link to="/about-us" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link to="/contact-us" className="hover:text-white transition-colors">Contact Us</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms-and-conditions" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
            <li><Link to="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h3 className="text-white text-sm font-bold uppercase tracking-widest mb-6">Get in Touch</h3>
          <ul className="space-y-4 text-sm">
            <li>
              <a href="tel:+917075504625" className="flex items-center justify-center md:justify-start gap-3 hover:text-white transition-colors">
                <Phone className="w-4 h-4" />
                <span>+91 7075504625</span>
              </a>
            </li>
            <li>
              <a href="mailto:dritzz.info@gmail.com" className="flex items-center justify-center md:justify-start gap-3 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
                <span>dritzz.info@gmail.com</span>
              </a>
            </li>
            <li>
              <a href="https://dritzz.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center md:justify-start gap-3 hover:text-white transition-colors">
                <Globe className="w-4 h-4" />
                <span>https://dritzz.com</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-center text-center">
        <span className="text-xs uppercase tracking-widest font-bold text-neutral-500">
          &copy; 2026 Dritzz. All Rights Reserved.
        </span>
      </div>
    </footer>
  );
}
