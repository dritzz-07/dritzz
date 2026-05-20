import { Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import logoImage from '../assets/images/regenerated_image_1779294281601.png';

export default function Footer() {
  return (
    <footer id="contact" className="bg-black border-t border-white/5 px-6 md:px-16 py-8 md:py-0 md:h-24 flex flex-col md:flex-row items-center justify-center md:justify-between gap-6 md:gap-0 text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
      <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
        <img src={logoImage} alt="Dritzz Logo" className="w-[50px] h-[50px]" />
        <span>&copy; {new Date().getFullYear()} Dritzz Car Wash Hyderabad</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-center">
        <a href="tel:7075504625" className="hover:text-white transition-colors decoration-none">7075504625</a>
        <a href="mailto:dritzz.info@gmail.com" className="hover:text-white transition-colors decoration-none">dritzz.info@gmail.com</a>
        <Link to="/admin" className="hover:text-white transition-colors decoration-none">Admin</Link>
      </div>
    </footer>
  );
}
