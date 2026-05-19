import { Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer id="contact" className="h-24 bg-black border-t border-white/5 px-6 md:px-16 flex items-center justify-between text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
      <div className="flex items-center gap-4">
        <img src="/logo_v2.svg" alt="Dritzz Logo" className="h-10 w-auto" />
        <span>&copy; {new Date().getFullYear()} Dritzz Car Wash Hyderabad</span>
      </div>
      <div className="flex gap-6">
        <a href="tel:7075504625" className="hover:text-white transition-colors decoration-none">7075504625</a>
        <a href="mailto:dritzz.info@gmail.com" className="hover:text-white transition-colors decoration-none">dritzz.info@gmail.com</a>
        <Link to="/admin" className="hover:text-white transition-colors decoration-none">Admin</Link>
      </div>
    </footer>
  );
}
