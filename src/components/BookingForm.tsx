import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Lock, ChevronRight } from 'lucide-react';
import { PACKAGES, TIME_SLOTS } from '../constants';
import { BookingDetails, VehicleType } from '../types';
import { useAuth } from '../context/AuthContext';

interface BookingFormProps {
  initialVehicle?: VehicleType;
  initialPackageId?: string;
  onSubmit: (details: BookingDetails) => void;
  isDiscountApplied?: boolean;
  onRequireAuth?: () => void;
}

export default function BookingForm({ 
  initialVehicle, 
  initialPackageId, 
  onSubmit, 
  isDiscountApplied,
  onRequireAuth
}: BookingFormProps) {
  const { user, loginWithGoogle } = useAuth();
  const [details, setDetails] = useState<BookingDetails>({
    name: '',
    phone: '',
    email: '',
    address: '',
    date: '',
    timeSlot: '',
    vehicleType: initialVehicle || 'hatchback',
    packageId: initialPackageId || '',
    notes: ''
  });

  useEffect(() => {
    if (initialVehicle) setDetails(prev => ({ ...prev, vehicleType: initialVehicle }));
    if (initialPackageId) setDetails(prev => ({ ...prev, packageId: initialPackageId }));
  }, [initialVehicle, initialPackageId]);

  useEffect(() => {
    if (user) {
      setDetails(prev => ({
        ...prev,
        name: user.displayName || prev.name,
        email: user.email || prev.email,
        phone: user.phoneNumber || prev.phone
      }));
    }
  }, [user]);

  const selectedPkg = PACKAGES.find(p => p.id === details.packageId);
  const originalPrice = selectedPkg ? selectedPkg.price[details.vehicleType] : 0;
  const totalPrice = isDiscountApplied ? Math.round(originalPrice * 0.75) : originalPrice;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.name || !details.phone || !details.address || !details.date || !details.timeSlot || !details.packageId) {
      alert('Please fill in all required fields.');
      return;
    }
    onSubmit({ ...details, userId: user?.uid });
  };

  return (
    <section id="booking" className="bg-black px-6 md:px-16 py-24 border-t border-white/5">
      <div className="section-label">Reserve Your Slot</div>
      <h2 className="section-title text-white">BOOK NOW</h2>
      <p className="text-neutral-400 max-w-md mb-16">Fill in your details and we'll be at your doorstep on time.</p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
        <form onSubmit={handleFormSubmit} className="lg:col-span-3 bg-white/5 border border-white/10 p-8 md:p-12 space-y-8 rounded-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold block">Full Name</label>
              <input
                required
                type="text"
                name="name"
                value={details.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-white outline-none transition-colors rounded-lg text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold block">Phone Number</label>
              <input
                required
                type="tel"
                name="phone"
                value={details.phone}
                onChange={handleChange}
                placeholder="+91 XXXXX XXXXX"
                className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-white outline-none transition-colors rounded-lg text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold block">Email Address (optional)</label>
            <input
              type="email"
              name="email"
              value={details.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-white outline-none transition-colors rounded-lg text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold block">Service Address</label>
            <input
              required
              type="text"
              name="address"
              value={details.address}
              onChange={handleChange}
              placeholder="Flat no, Building, Area, Hyderabad"
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-white outline-none transition-colors rounded-lg text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold block">Preferred Date</label>
              <input
                required
                type="date"
                name="date"
                value={details.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-white outline-none transition-colors rounded-lg text-white [color-scheme:dark]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold block">Time Slot</label>
              <select
                required
                name="timeSlot"
                value={details.timeSlot}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-white outline-none transition-colors appearance-none rounded-lg text-white"
              >
                <option value="" className="bg-black">Select a slot</option>
                {TIME_SLOTS.map(s => <option key={s} value={s} className="bg-black">{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold block">Vehicle Type</label>
              <select
                required
                name="vehicleType"
                value={details.vehicleType}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-white outline-none transition-colors appearance-none rounded-lg text-white"
              >
                <option value="hatchback" className="bg-black">Hatchback</option>
                <option value="sedan" className="bg-black">Sedan</option>
                <option value="suv" className="bg-black">SUV / MUV</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold block">Package</label>
              <select
                required
                name="packageId"
                value={details.packageId}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-white outline-none transition-colors appearance-none rounded-lg text-white"
              >
                <option value="" className="bg-black">Select a package</option>
                {PACKAGES.map(p => <option key={p.id} value={p.id} className="bg-black">{p.name}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold block">Special Instructions</label>
            <textarea
              name="notes"
              value={details.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Any specific areas to focus on..."
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-white outline-none transition-colors resize-none rounded-lg text-white"
            />
          </div>
        </form>

        <div className="lg:col-span-2 space-y-6 lg:sticky lg:top-32">
          <div className="bg-white text-black p-8 md:p-10 rounded-2xl shadow-2xl">
            <h3 className="font-bold text-sm tracking-widest uppercase mb-8 pb-4 border-b border-black/10 text-black">Order Summary</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center py-2 border-b border-black/5">
                <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Package</span>
                <span className="text-sm font-medium text-black">{selectedPkg?.name || '—'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-black/5">
                <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Vehicle</span>
                <span className="text-sm font-medium text-black capitalize">{details.vehicleType}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-black/5">
                <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Date</span>
                <span className="text-sm font-medium text-black">{details.date || '—'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-black/5">
                <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Slot</span>
                <span className="text-sm font-medium text-black">{details.timeSlot || '—'}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-black mb-10">
              <div className="flex flex-col">
                <span className="font-bold text-sm uppercase tracking-widest text-black">Total Amount</span>
                {isDiscountApplied && (
                  <span className="text-[9px] text-green-600 font-bold uppercase tracking-widest">25% Discount Applied</span>
                )}
              </div>
              <div className="flex flex-col items-end">
                <span className="text-4xl font-bold text-black tracking-tighter">₹{totalPrice}</span>
                {isDiscountApplied && (
                  <span className="text-xs text-neutral-400 line-through decoration-black/20">₹{originalPrice}</span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                if (!user && onRequireAuth) {
                  onRequireAuth();
                } else if (!user) {
                  loginWithGoogle();
                } else {
                  handleFormSubmit(e);
                }
              }}
              className="w-full bg-black text-white py-5 rounded-xl font-bold text-sm tracking-widest uppercase hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {user ? (
                <>Confirm Booking <ChevronRight className="w-5 h-5" /></>
              ) : (
                <>Sign In to Book <ChevronRight className="w-5 h-5" /></>
              )}
            </button>

            <div className="mt-6 flex items-center justify-center gap-2 text-neutral-500 text-[10px] uppercase tracking-widest font-bold">
              <Lock className="w-3 h-3" /> 100% Secure Service
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
