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
}

export default function MyBookingsModal({ isOpen, onClose }: MyBookingsProps) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingDocument[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history' | 'subscriptions'>('subscriptions');

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
      setSubscriptions(fetchedSub);
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
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
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
                  <p className="text-neutral-500 text-xs mt-1">Manage your active plans and washes.</p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/50" />
                </button>
              </div>
              
              <div className="flex bg-neutral-800/50 p-1 rounded-xl w-fit overflow-x-auto max-w-full hide-scrollbar">
                <button
                  onClick={() => setActiveTab('subscriptions')}
                  className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                    activeTab === 'subscriptions' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  My Plans
                </button>
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                    activeTab === 'upcoming' 
                      ? 'bg-emerald-500 text-black shadow-md' 
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Upcoming Washes
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
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
                  <p className="text-xs uppercase tracking-widest font-bold">Loading Data...</p>
                </div>
              ) : activeTab === 'subscriptions' ? (
                subscriptions.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Gem className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-white font-bold mb-2">No Active Plans</h3>
                    <p className="text-neutral-500 text-sm mb-6">Upgrade to our Monthly Plan for hassle-free washes.</p>
                    <button onClick={onClose} className="bg-blue-600 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition">View Plans</button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {subscriptions.map((sub) => {
                      const percentUsed = sub.totalWashes > 0 ? (sub.usedWashes / sub.totalWashes) * 100 : 0;
                      const isExpired = sub.expiresAt?.toDate ? new Date() > sub.expiresAt.toDate() : false;
                      const activeStatus = isExpired ? 'Expired' : (sub.remainingWashes > 0 ? 'Active' : 'Completed');

                      return (
                        <div key={sub.id} className="bg-white/5 border border-white/10 rounded-[24px] overflow-hidden">
                           <div className="p-6 border-b border-white/5 bg-gradient-to-r from-blue-900/40 to-transparent flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                              <div>
                                 <div className="text-xs uppercase tracking-widest font-black text-blue-400 mb-1">Monthly Plan</div>
                                 <div className="text-xl font-bold text-white capitalize">{sub.vehicles?.length} Vehicle(s)</div>
                              </div>
                              <div className="flex items-center gap-3">
                                 <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${activeStatus === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-500'}`}>
                                    {activeStatus}
                                 </div>
                              </div>
                           </div>
                           
                           <div className="p-6">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                                 <div className="bg-white/5 p-4 rounded-xl text-center">
                                    <div className="text-4xl font-black text-white mb-1">{sub.totalWashes}</div>
                                    <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest">Total Washes</div>
                                 </div>
                                 <div className="bg-white/5 p-4 rounded-xl text-center">
                                    <div className="text-4xl font-black text-white mb-1">{sub.usedWashes}</div>
                                    <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest">Used</div>
                                 </div>
                                 <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-center">
                                    <div className="text-4xl font-black text-blue-400 mb-1">{sub.remainingWashes}</div>
                                    <div className="text-[10px] uppercase font-bold text-blue-400 tracking-widest">Remaining</div>
                                 </div>
                              </div>
                              
                              <div className="mb-8">
                                 <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Usage</span>
                                    <span className="text-xs font-bold text-white tracking-widest">{sub.usedWashes} / {sub.totalWashes}</span>
                                 </div>
                                 <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${percentUsed}%` }}></div>
                                 </div>
                              </div>

                              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/5 p-4 rounded-xl">
                                 <div className="text-xs text-neutral-400 font-medium">
                                    <span className="font-bold text-neutral-300">Expires:</span> {sub.expiresAt?.toDate ? sub.expiresAt.toDate().toLocaleDateString('en-GB') : ''}
                                 </div>
                                 {schedulingSub?.id === sub.id ? (
                                    <div className="flex flex-col sm:flex-row gap-3 items-center ml-auto">
                                       <input 
                                          type="date" 
                                          value={scheduleDate} 
                                          onChange={e => setScheduleDate(e.target.value)} 
                                          className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs focus:border-white transition-colors outline-none text-white" 
                                          style={{ colorScheme: 'dark' }}
                                       />
                                       <select 
                                          value={scheduleTime} 
                                          onChange={e => setScheduleTime(e.target.value)} 
                                          className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs focus:border-white transition-colors outline-none appearance-none"
                                       >
                                          {['09:00 AM - 11:00 AM', '11:00 AM - 01:00 PM', '01:00 PM - 03:00 PM', '03:00 PM - 05:00 PM', '05:00 PM - 07:00 PM'].map(time => (
                                             <option key={time} value={time}>{time}</option>
                                          ))}
                                       </select>
                                       <button 
                                          onClick={handleScheduleSubmit}
                                          disabled={isSubmittingSchedule || !scheduleDate}
                                          className="px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest bg-emerald-500 text-black hover:bg-emerald-400 transition-all disabled:opacity-50"
                                       >
                                          {isSubmittingSchedule ? '...' : 'Confirm'}
                                       </button>
                                       <button onClick={() => setSchedulingSub(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><X className="w-4 h-4 text-neutral-400" /></button>
                                    </div>
                                 ) : (
                                    <button 
                                       className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ml-auto
                                          ${activeStatus === 'Active' 
                                             ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                             : 'bg-white/10 text-neutral-500 cursor-not-allowed'}`}
                                       onClick={() => {
                                          if(activeStatus === 'Active') {
                                             setSchedulingSub(sub);
                                          }
                                       }}
                                    >
                                       Schedule Next Wash
                                    </button>
                                 )}
                              </div>
                           </div>
                        </div>
                      )
                    })}
                  </div>
                )
              ) : displayedBookings.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-6 h-6 text-white/30" />
                  </div>
                  <h3 className="text-white font-bold mb-2">No {activeTab} washes yet</h3>
                  <p className="text-neutral-500 text-sm">You haven't made any reservations that appear here.</p>
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
                              <span className="px-3 py-1 bg-white border border-white text-black text-[10px] font-black uppercase tracking-widest rounded-full">
                                {booking.status}
                              </span>
                              <span className="text-neutral-500 text-xs font-mono">Ref: {booking.refId}</span>
                              {booking.subscriptionId && (
                                 <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest rounded flex items-center gap-1">
                                    <Gem className="w-3 h-3" /> Plan Wash
                                 </span>
                              )}
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
                                  
                                  {activeTab === 'upcoming' && (
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
                                  )}
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
