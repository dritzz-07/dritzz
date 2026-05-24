import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Car, CreditCard, Loader2, MapPin, Download, PackageOpen, Gem, ArrowRight, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import LiveTracker from './LiveTracker';
import { PACKAGES } from '../constants';
import { generateInvoice } from '../lib/pdf';
import { BookingDocument, Subscription } from '../types';

interface MyBookingsProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'upcoming' | 'history' | 'subscriptions';
}

export default function MyBookingsModal({ isOpen, onClose, initialTab = 'upcoming' }: MyBookingsProps) {
  const { user, userProfile } = useAuth();
  const [bookings, setBookings] = useState<BookingDocument[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history' | 'subscriptions'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  const [schedulingSub, setSchedulingSub] = useState<Subscription | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('09:00 AM - 11:00 AM');
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);

  useEffect(() => {
    if (!isOpen || !user?.uid) return;

    setLoading(true);
    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', user.uid)
    );

    const unsubscribeBookings = onSnapshot(q, (snapshot) => {
      const fetchedBookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BookingDocument[];
      
      fetchedBookings.sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime());
      setBookings(fetchedBookings);
    });

    const sq = query(
      collection(db, 'subscriptions'),
      where('userId', '==', user.uid)
    );

    const unsubscribeSubscriptions = onSnapshot(sq, (snapshot) => {
      const fetchedSub = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Subscription[];
      const monthlySubs = fetchedSub.filter(s => s.packageId === 'monthly');
      setSubscriptions(monthlySubs);
      setLoading(false);
    });

    return () => {
      unsubscribeBookings();
      unsubscribeSubscriptions();
    };
  }, [isOpen, user]);

  const handleDownloadInvoice = (booking: BookingDocument, pkgName: string) => {
    const pkg = PACKAGES.find(p => p.id === booking.packageId) || PACKAGES[0];
    const details = {
      name: booking.name || userProfile?.fullName || user?.displayName || 'Customer',
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
    generateInvoice(details, pkg, booking.amount || 0, booking.paymentMethod || 'Manual', booking.refId, booking.status);
  };

  const upcomingBookings = bookings.filter(b => ['pending', 'scheduled', 'confirmed', 'in-progress'].includes((b.status || '').toLowerCase()));
  const historyBookings = bookings.filter(b => ['completed', 'cancelled'].includes((b.status || '').toLowerCase()));
  const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : historyBookings;

  const handleScheduleSubmit = async () => {
    if (!schedulingSub || !scheduleDate) return;
    setIsSubmittingSchedule(true);
    try {
      const refId = `SUB-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
      
      // Determine what to pass as vehicles/vehicle details based on what's in the subscription
      let vehiclesToBook = schedulingSub.vehicles || [];

      const scheduledBookingPayload: any = {
        userId: user?.uid || 'guest',
        name: schedulingSub.customerName,
        phone: schedulingSub.customerPhone,
        address: schedulingSub.address,
        packageId: schedulingSub.packageId,
        date: scheduleDate,
        timeSlot: scheduleTime,
        vehicles: vehiclesToBook,
        amount: 0,
        refId,
        paymentMethod: 'subscription',
        status: 'scheduled',
        subscriptionId: schedulingSub.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      Object.keys(scheduledBookingPayload).forEach(key => {
        if (scheduledBookingPayload[key] === undefined) delete scheduledBookingPayload[key];
      });

      await addDoc(collection(db, 'bookings'), scheduledBookingPayload);

      alert("Wash Scheduled successfully! We will confirm shortly.");
      setSchedulingSub(null);
      setActiveTab('upcoming');
    } catch (e: any) {
      console.error(e);
      alert("Failed to schedule wash: " + e.message);
    } finally {
      setIsSubmittingSchedule(false);
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
            className="absolute inset-0 bg-black/80 "
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-4xl bg-neutral-900 border border-white/10 rounded-[32px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] max-h-[90vh] flex flex-col"
          >
            <div className="p-6 md:p-8 border-b border-white/5 shrink-0 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tighter uppercase">My Dashboard</h2>
                  <p className="text-white text-xs mt-1 font-medium">Welcome back, {userProfile?.fullName?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Customer'}</p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/80" />
                </button>
              </div>
              
              <div className="flex bg-neutral-800/50 p-1 rounded-xl w-fit overflow-x-auto max-w-full hide-scrollbar">
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                    activeTab === 'upcoming' 
                      ? 'bg-zinc-500 text-black shadow-md' 
                      : 'text-neutral-100 hover:text-white'
                  }`}
                >
                  Upcoming Washes
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                    activeTab === 'history' 
                      ? 'bg-white/10 text-white shadow-md' 
                      : 'text-neutral-100 hover:text-white'
                  }`}
                >
                  Booking History
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-neutral-300">
                  <Loader2 className="w-8 h-8 animate-spin mb-4" />
                  <p className="text-xs uppercase tracking-widest font-bold">Loading Data...</p>
                </div>
              ) : displayedBookings.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-6 h-6 text-white/30" />
                  </div>
                  <h3 className="text-white font-bold mb-2">No {activeTab} washes yet</h3>
                  <p className="text-neutral-300 text-xs">You haven't made any reservations that appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayedBookings.map((booking) => {
                    const pkgName = PACKAGES.find(p => p.id === booking.packageId)?.name || booking.packageId;
                    return (
                      <div key={booking.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col transition-all duration-300">
                        {/* the rest of booking code is same */}
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                          <div className="space-y-4 flex-1">
                            <div className="flex items-center gap-3">
                              <span className="px-3 py-1 bg-white border border-white text-black text-xs font-black uppercase tracking-widest rounded-full">
                                {booking.status}
                              </span>
                              <span className="text-neutral-300 text-xs font-mono">Ref: {booking.refId}</span>
                              {booking.subscriptionId && (
                                 <span className="px-2 py-1 bg-zinc-500/20 text-white text-[11px] font-black uppercase tracking-widest rounded flex items-center gap-1">
                                    <Gem className="w-3 h-3" /> Plan Wash
                                 </span>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-x-8 gap-y-3 pt-1">
                              <div className="flex items-center gap-2 text-xs text-neutral-300">
                                <PackageOpen className="w-4 h-4 text-neutral-300" />
                                <span className="font-medium text-white">{pkgName}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-neutral-300">
                                <Car className="w-4 h-4 text-neutral-300" />
                                <span className="capitalize">{booking.vehicles && booking.vehicles.length > 0 ? `${booking.vehicles.length} Vehicle(s)` : booking.vehicleType}</span>
                              </div>
                              {booking.vehicles && booking.vehicles.length > 0 && (
                                <div className="col-span-2 mt-2">
                                   <div className="flex flex-col gap-2">
                                      {booking.vehicles.map((v, i) => (
                                         <div key={i} className="flex justify-between items-center text-xs bg-white/5 p-2 rounded-lg border border-white/5">
                                            <div>
                                               <span className="font-bold text-white">{v.brand || 'Custom'} {v.model || 'Vehicle'}</span>
                                               <span className="text-neutral-300 ml-2 uppercase">[{v.type}]</span>
                                            </div>
                                            {(v.vehicleNumber) && <span className="text-neutral-100 font-mono">{v.vehicleNumber}</span>}
                                         </div>
                                      ))}
                                   </div>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-xs text-neutral-300">
                                <Calendar className="w-4 h-4 text-neutral-300" />
                                {booking.date} at {booking.timeSlot}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-neutral-300">
                                <CreditCard className="w-4 h-4 text-neutral-300" />
                                <span className="capitalize">{booking.paymentMethod}</span>
                              </div>
                              
                              {/* Service Location Tab Section */}
                              <div className="col-span-2 pt-3 border-t border-white/5 space-y-3">
                                <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl p-3">
                                  <div className="flex items-start gap-3 text-xs text-neutral-300 max-w-[65%]">
                                    <div className="p-2 bg-zinc-500/10 border border-white/5 rounded-lg shrink-0">
                                      <MapPin className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="text-left">
                                      <div className="text-xs uppercase font-black text-white tracking-wider mb-1">Service Location</div>
                                      <span className="line-clamp-2 text-xs text-neutral-300 font-medium leading-relaxed">
                                        {booking.address || 'Doorstep Service Location'}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {activeTab === 'upcoming' && (
                                    <button
                                      onClick={() => setActiveTrackId(activeTrackId === booking.id ? null : booking.id)}
                                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer border
                                        ${activeTrackId === booking.id 
                                          ? 'bg-zinc-500 text-black border-zinc-400 shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:brightness-95' 
                                          : 'bg-zinc-500/10 text-white border-zinc-500/25 hover:bg-zinc-500/20 hover:border-zinc-500/40 animate-pulse'
                                        }`}
                                    >
                                      <span className="relative flex h-2 w-2">
                                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${activeTrackId === booking.id ? 'bg-black' : 'bg-zinc-400'}`}></span>
                                        <span className={`relative inline-flex rounded-full h-2 w-2 ${activeTrackId === booking.id ? 'bg-black' : 'bg-zinc-500'}`}></span>
                                      </span>
                                      {activeTrackId === booking.id ? 'Map Active' : 'Live Location'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="md:text-right border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6 flex flex-col justify-center shrink-0 min-w-[100px]">
                            <div className="text-xs uppercase tracking-widest text-neutral-300 font-bold mb-1">Amount</div>
                            <div className="text-2xl font-black text-white tracking-tighter">₹{booking.amount}</div>
                            <button
                              onClick={() => handleDownloadInvoice(booking, pkgName)}
                              className="mt-3 flex items-center gap-2 justify-center md:justify-end text-xs uppercase font-bold tracking-widest text-white hover:text-neutral-300 transition-colors"
                            >
                              <Download className="w-3 h-3" />
                              Invoice
                            </button>
                          </div>
                        </div>

                        {activeTrackId === booking.id && (
                          <LiveTracker
                            bookingId={booking.id || ''}
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
