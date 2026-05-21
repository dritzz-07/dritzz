import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Car, CreditCard, Loader2, MapPin, Download, PackageOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import LiveTracker from './LiveTracker';
import { PACKAGES } from '../constants';
import { generateInvoice } from '../lib/pdf';

interface MyBookingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Booking {
  id: string;
  refId: string;
  vehicleType: string;
  packageId: string;
  date: string;
  timeSlot: string;
  amount: number;
  status: string;
  paymentMethod: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  name?: string;
  phone?: string;
  email?: string;
  createdAt?: any;
  vehicles?: any[];
}

export default function MyBookingsModal({ isOpen, onClose }: MyBookingsProps) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

  useEffect(() => {
    if (!isOpen || !user?.uid) return;

    setLoading(true);
    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedBookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Booking[];
      
      // Sort bookings by date descending (rough sort)
      fetchedBookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setBookings(fetchedBookings);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching bookings:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen, user]);

  const handleDownloadInvoice = (booking: Booking, pkgName: string) => {
    const pkg = PACKAGES.find(p => p.id === booking.packageId) || PACKAGES[0];
    const details = {
      name: booking.name || 'User',
      phone: booking.phone || '',
      email: booking.email || user?.email || '',
      address: booking.address || '',
      date: booking.date,
      timeSlot: booking.timeSlot,
      vehicleType: booking.vehicleType as any,
      packageId: booking.packageId,
      vehicles: booking.vehicles || [],
      notes: ''
    };
    generateInvoice(details, pkg, booking.amount, booking.paymentMethod, booking.refId, booking.status);
  };

  const upcomingBookings = bookings.filter(b => ['pending', 'confirmed', 'in-progress'].includes(b.status.toLowerCase()));
  const historyBookings = bookings.filter(b => ['completed', 'cancelled'].includes(b.status.toLowerCase()));
  const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : historyBookings;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-neutral-900 border border-white/10 rounded-[32px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] max-h-[85vh] flex flex-col"
          >
            <div className="p-6 md:p-8 border-b border-white/5 shrink-0 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tighter uppercase">My Bookings</h2>
                  <p className="text-neutral-500 text-xs mt-1">View your requested car washes.</p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/50" />
                </button>
              </div>
              
              <div className="flex bg-neutral-800/50 p-1 rounded-xl w-fit">
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${
                    activeTab === 'upcoming' 
                      ? 'bg-emerald-500 text-black shadow-md' 
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Current Bookings
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${
                    activeTab === 'history' 
                      ? 'bg-white/10 text-white shadow-md' 
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Booking History
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
                  <Loader2 className="w-8 h-8 animate-spin mb-4" />
                  <p className="text-xs uppercase tracking-widest font-bold">Loading Bookings...</p>
                </div>
              ) : displayedBookings.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-6 h-6 text-white/30" />
                  </div>
                  <h3 className="text-white font-bold mb-2">No {activeTab} bookings yet</h3>
                  <p className="text-neutral-500 text-sm">You haven't made any reservations that appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayedBookings.map((booking) => {
                    const pkgName = PACKAGES.find(p => p.id === booking.packageId)?.name || booking.packageId;
                    return (
                      <div key={booking.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col transition-all duration-300">
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                          <div className="space-y-4 flex-1">
                            <div className="flex items-center gap-3">
                              <span className="px-3 py-1 bg-white border border-white text-black text-[10px] font-black uppercase tracking-widest rounded-full">
                                {booking.status}
                              </span>
                              <span className="text-neutral-500 text-xs font-mono">Ref: {booking.refId}</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-x-8 gap-y-3 pt-1">
                              <div className="flex items-center gap-2 text-sm text-neutral-300">
                                <PackageOpen className="w-4 h-4 text-neutral-500" />
                                <span className="font-medium text-white">{pkgName}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-neutral-300">
                                <Car className="w-4 h-4 text-neutral-500" />
                                <span className="capitalize">{booking.vehicles && booking.vehicles.length > 0 ? `${booking.vehicles.length} Vehicle(s)` : booking.vehicleType}</span>
                              </div>
                              {booking.vehicles && booking.vehicles.length > 0 && (
                                <div className="col-span-2 mt-2">
                                   <div className="flex flex-col gap-2">
                                      {booking.vehicles.map((v, i) => (
                                         <div key={i} className="flex justify-between items-center text-xs bg-white/5 p-2 rounded-lg border border-white/5">
                                            <div>
                                               <span className="font-bold text-white">{v.brand || 'Custom'} {v.model || 'Vehicle'}</span>
                                               <span className="text-neutral-500 ml-2 uppercase">[{v.type}]</span>
                                            </div>
                                            {(v.vehicleNumber) && <span className="text-neutral-400 font-mono">{v.vehicleNumber}</span>}
                                         </div>
                                      ))}
                                   </div>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-sm text-neutral-300">
                                <Calendar className="w-4 h-4 text-neutral-500" />
                                {booking.date} at {booking.timeSlot}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-neutral-300">
                                <CreditCard className="w-4 h-4 text-neutral-500" />
                                <span className="capitalize">{booking.paymentMethod}</span>
                              </div>
                              
                              {/* Service Location Tab Section */}
                              <div className="col-span-2 pt-3 border-t border-white/5 space-y-3">
                                <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl p-3">
                                  <div className="flex items-start gap-3 text-sm text-neutral-300 max-w-[65%]">
                                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg shrink-0">
                                      <MapPin className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <div className="text-left">
                                      <div className="text-[10px] uppercase font-black text-emerald-400 tracking-wider mb-1">Service Location</div>
                                      <span className="line-clamp-2 text-xs text-neutral-300 font-medium leading-relaxed">
                                        {booking.address || 'Doorstep Service Location'}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <button
                                    onClick={() => setActiveTrackId(activeTrackId === booking.id ? null : booking.id)}
                                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer border
                                      ${activeTrackId === booking.id 
                                        ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:brightness-95' 
                                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20 hover:border-emerald-500/40 animate-pulse'
                                      }`}
                                  >
                                    <span className="relative flex h-2 w-2">
                                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${activeTrackId === booking.id ? 'bg-black' : 'bg-emerald-400'}`}></span>
                                      <span className={`relative inline-flex rounded-full h-2 w-2 ${activeTrackId === booking.id ? 'bg-black' : 'bg-emerald-500'}`}></span>
                                    </span>
                                    {activeTrackId === booking.id ? 'Map Active' : 'Live Location'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="md:text-right border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6 flex flex-col justify-center shrink-0 min-w-[100px]">
                            <div className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-1">Amount</div>
                            <div className="text-2xl font-black text-white tracking-tighter">₹{booking.amount}</div>
                            <button
                              onClick={() => handleDownloadInvoice(booking, pkgName)}
                              className="mt-3 flex items-center gap-2 justify-center md:justify-end text-[10px] uppercase font-bold tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                              <Download className="w-3 h-3" />
                              Invoice
                            </button>
                          </div>
                        </div>

                        {/* Map overlay container */}
                        {activeTrackId === booking.id && (
                          <LiveTracker
                            bookingId={booking.id}
                            refId={booking.refId}
                            address={booking.address || 'Doorstep Service Location'}
                            status={booking.status}
                            onClose={() => setActiveTrackId(null)}
                            latitude={booking.latitude}
                            longitude={booking.longitude}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
