import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Car, CreditCard, Loader2, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import LiveTracker from './LiveTracker';

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
}

export default function MyBookingsModal({ isOpen, onClose }: MyBookingsProps) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      loadBookings();
    }
  }, [isOpen, user]);

  const loadBookings = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'bookings'),
        where('userId', '==', user.uid),
      );
      const snapshot = await getDocs(q);
      const fetchedBookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Booking[];
      setBookings(fetchedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

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
            <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center shrink-0">
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

            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
                  <Loader2 className="w-8 h-8 animate-spin mb-4" />
                  <p className="text-xs uppercase tracking-widest font-bold">Loading Bookings...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-6 h-6 text-white/30" />
                  </div>
                  <h3 className="text-white font-bold mb-2">No bookings yet</h3>
                  <p className="text-neutral-500 text-sm">You haven't made any reservations yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
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
                              <Calendar className="w-4 h-4 text-neutral-500" />
                              {booking.date} at {booking.timeSlot}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-neutral-300">
                              <Car className="w-4 h-4 text-neutral-500" />
                              <span className="capitalize">{booking.vehicleType}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-neutral-300">
                              <CreditCard className="w-4 h-4 text-neutral-500" />
                              <span className="capitalize">{booking.paymentMethod}</span>
                            </div>
                            
                            {/* Service Address & Location Action Tab Option */}
                            <div className="col-span-2 pt-2 border-t border-white/5 space-y-2">
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-start gap-2 text-sm text-neutral-300 max-w-[65%]">
                                  <MapPin className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                                  <div className="text-left">
                                    <div className="text-[9px] uppercase font-bold text-neutral-500 leading-none mb-1">Service Address</div>
                                    <span className="line-clamp-2 text-xs text-neutral-400 font-medium">
                                      {booking.address || 'Doorstep Service Location'}
                                    </span>
                                  </div>
                                </div>
                                
                                <button
                                  onClick={() => setActiveTrackId(activeTrackId === booking.id ? null : booking.id)}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer
                                    ${activeTrackId === booking.id 
                                      ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:brightness-95' 
                                      : 'bg-white/5 hover:bg-white/10 border border-white/10 text-emerald-400'
                                    }`}
                                >
                                  <span className="relative flex h-2 w-2">
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${activeTrackId === booking.id ? 'bg-black' : 'bg-emerald-400'}`}></span>
                                    <span className={`relative inline-flex rounded-full h-2 w-2 ${activeTrackId === booking.id ? 'bg-black' : 'bg-emerald-500'}`}></span>
                                  </span>
                                  Live Location
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="md:text-right border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6 flex flex-col justify-center shrink-0 min-w-[100px]">
                          <div className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-1">Amount</div>
                          <div className="text-2xl font-black text-white tracking-tighter">₹{booking.amount}</div>
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
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
