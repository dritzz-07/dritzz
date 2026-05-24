import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, CarFront, FileText, LifeBuoy, Settings, Loader2, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { generateInvoice } from '../lib/pdf';
import { BookingDocument, Package } from '../types';
import { PACKAGES } from '../constants';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'addresses' | 'vehicles' | 'invoices' | 'support' | 'settings';
}

export default function AccountSettingsModal({ isOpen, onClose, initialTab = 'settings' }: AccountSettingsModalProps) {
  const { user, userProfile, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isSaving, setIsSaving] = useState(false);
  const [carModel, setCarModel] = useState(userProfile?.carModel || '');
  
  // Settings form
  const [fullName, setFullName] = useState(userProfile?.fullName || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  // Address form
  const [address, setAddress] = useState(userProfile?.address || '');

  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Invoices data
  const [pastBookings, setPastBookings] = useState<BookingDocument[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
    setSaveSuccess(null);
  }, [initialTab, isOpen]);

  useEffect(() => {
    if (isOpen && userProfile) {
      setCarModel(userProfile.carModel || '');
      setFullName(userProfile.fullName || '');
      setEmail(userProfile.email || '');
      setPhone(userProfile.phone || '');
      setAddress(userProfile.address || '');
    }
  }, [isOpen]); // Only initialize when modal opens

  useEffect(() => {
    if (!isOpen || !user?.uid) return;

    setLoadingBookings(true);
    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedBookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BookingDocument[];
      
      const completed = fetchedBookings;
      completed.sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime());
      
      setPastBookings(completed);
      setLoadingBookings(false);
    });

    return () => unsubscribe();
  }, [isOpen, user?.uid]);

  const handleSaveCarOption = async () => {
    if (!carModel.trim()) return;
    setIsSaving(true);
    try {
      await updateUserProfile({ carModel });
      setSaveSuccess('vehicles');
      setTimeout(() => setSaveSuccess(null), 2000);
    } catch (e) {
      console.error(e);
    }
    setIsSaving(false);
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile({ fullName, email, phone });
      setSaveSuccess('settings');
      setTimeout(() => setSaveSuccess(null), 2000);
    } catch (e) {
      console.error(e);
    }
    setIsSaving(false);
  };

  const handleSaveAddress = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile({ address });
      setSaveSuccess('addresses');
      setTimeout(() => setSaveSuccess(null), 2000);
    } catch (e) {
      console.error(e);
    }
    setIsSaving(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[80vh] md:h-[600px]"
        >
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-black/50 border-r border-white/5 p-4 flex flex-col gap-1 overflow-y-auto">
            <h2 className="text-lg font-bold text-white mb-4 px-2 tracking-tight">Account</h2>
            
            {[
              { id: 'vehicles', icon: CarFront, label: 'Saved Vehicles' },
              { id: 'addresses', icon: MapPin, label: 'Saved Addresses' },
              { id: 'invoices', icon: FileText, label: 'Invoices' },
              { id: 'support', icon: LifeBuoy, label: 'Support' },
              { id: 'settings', icon: Settings, label: 'Settings' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm ${
                  activeTab === tab.id
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-neutral-900 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8">
              {activeTab === 'vehicles' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h3 className="text-2xl font-bold text-white mb-2">Saved Vehicles</h3>
                  <p className="text-sm text-neutral-400 mb-8">Manage your registered vehicles for quick bookings.</p>
                  
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Primary Vehicle Model</label>
                      <input 
                        type="text"
                        value={carModel}
                        onChange={(e) => setCarModel(e.target.value)}
                        placeholder="e.g. Hyundai Creta"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                      />
                    </div>
                    <button
                      onClick={handleSaveCarOption}
                      disabled={isSaving}
                      className={`w-full flex justify-center items-center gap-2 font-bold py-3 rounded-xl transition-colors disabled:opacity-50 ${saveSuccess === 'vehicles' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saveSuccess === 'vehicles' ? 'Saved Successfully' : 'Save Vehicle'}
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'addresses' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h3 className="text-2xl font-bold text-white mb-2">Saved Addresses</h3>
                  <p className="text-sm text-neutral-400 mb-8">Manage your default location.</p>
                  
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Primary Address</label>
                      <textarea 
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. 123 Main St, Appt 4B"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium resize-none h-24 whitespace-pre-wrap"
                      />
                    </div>
                    <button
                      onClick={handleSaveAddress}
                      disabled={isSaving}
                      className={`w-full flex justify-center items-center gap-2 font-bold py-3 rounded-xl transition-colors disabled:opacity-50 ${saveSuccess === 'addresses' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saveSuccess === 'addresses' ? 'Saved Successfully' : 'Save Address'}
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'invoices' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h3 className="text-2xl font-bold text-white mb-2">Invoices</h3>
                  <p className="text-sm text-neutral-400 mb-8">Download past billing statements.</p>
                  
                  {loadingBookings ? (
                    <div className="flex flex-col items-center justify-center py-10 text-neutral-500">
                      <Loader2 className="w-6 h-6 animate-spin mb-2" />
                      <p className="text-xs uppercase tracking-widest font-bold">Loading Data...</p>
                    </div>
                  ) : pastBookings.length === 0 ? (
                    <div className="p-8 border border-white/5 border-dashed rounded-2xl flex flex-col items-center justify-center text-center">
                      <FileText className="w-8 h-8 text-neutral-600 mb-4" />
                      <p className="text-neutral-400 font-medium">No invoices available.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pastBookings.map((booking) => {
                        const pkgName = PACKAGES.find(p => p.id === booking.packageId)?.name || booking.packageId;
                        return (
                          <div key={booking.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 hover:bg-white/10">
                            <div>
                              <p className="font-bold text-white mb-1">{pkgName}</p>
                              <div className="flex items-center gap-2 text-xs text-neutral-400">
                                <span>{booking.date ? new Date(booking.date).toLocaleDateString('en-GB') : 'Unknown date'}</span>
                                <span className="w-1 h-1 rounded-full bg-neutral-600"></span>
                                <span>Ref: {booking.refId}</span>
                                <span className="w-1 h-1 rounded-full bg-neutral-600"></span>
                                <span className="capitalize">{booking.status}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-bold text-emerald-400 font-mono">₹{booking.amount}</span>
                              {booking.status !== 'cancelled' && (
                                <button
                                  onClick={() => {
                                    const pkg = PACKAGES.find(p => p.id === booking.packageId) || PACKAGES[0];
                                    const details = {
                                      name: booking.name || userProfile?.fullName || user?.displayName || 'Customer',
                                      phone: booking.phone || '',
                                      email: booking.email || user?.email || '',
                                      address: booking.address || '',
                                      date: booking.date || '',
                                      timeSlot: booking.timeSlot || '',
                                      vehicleType: booking.vehicleType as any,
                                      packageId: booking.packageId || '',
                                      vehicles: booking.vehicles || [],
                                      notes: ''
                                    };
                                    generateInvoice(details, pkg, booking.amount || 0, booking.paymentMethod || 'Manual', booking.refId || 'REF000', booking.status);
                                  }}
                                  className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center"
                                  title="Download Invoice"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'support' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h3 className="text-2xl font-bold text-white mb-2">Support</h3>
                  <p className="text-sm text-neutral-400 mb-8">Get help with your bookings or account.</p>
                  <div className="space-y-4">
                    <button className="w-full p-4 bg-black/30 border border-white/5 hover:border-white/20 rounded-xl text-left transition-colors">
                      <p className="font-bold text-white">Chat with us</p>
                      <p className="text-xs text-neutral-400 mt-1">Typically replies in 5 minutes</p>
                    </button>
                    <button className="w-full p-4 bg-black/30 border border-white/5 hover:border-white/20 rounded-xl text-left transition-colors">
                      <p className="font-bold text-white">Email Support</p>
                      <p className="text-xs text-neutral-400 mt-1">support@dritzz.com</p>
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h3 className="text-2xl font-bold text-white mb-2">Account Settings</h3>
                  <p className="text-sm text-neutral-400 mb-8">Manage your base account preferences.</p>
                  
                  <div className="space-y-4 max-w-md">
                    <div>
                      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Full Name</p>
                      <input 
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your Full Name"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Email Address</p>
                      <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your Email"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Phone Number</p>
                      <input 
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Your Phone Number"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                      />
                    </div>
                    <button
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                      className={`w-full flex justify-center items-center gap-2 font-bold py-3 rounded-xl transition-colors disabled:opacity-50 mt-4 ${saveSuccess === 'settings' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saveSuccess === 'settings' ? 'Saved Successfully' : 'Save Changes'}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
