import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, getDocs, updateDoc, doc, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { Mail, Lock, LogIn, ArrowRight, TrendingUp, Calendar, CheckCircle2, Car, Search, Phone, Plus, X, Trash2, Download, FileText, MapPin, Navigation } from 'lucide-react';
import * as XLSX from 'xlsx';
import { PACKAGES } from '../constants';
import { generateInvoice } from '../lib/pdf';

interface Booking {
  id: string;
  refId: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  vehicleType: string;
  vehicleMake: string;
  vehicleModel: string;
  packageId: string;
  date: string;
  timeSlot: string;
  amount: number;
  status: string;
  paymentMethod: string;
  createdAt: any;
  address?: string;
  latitude?: number;
  longitude?: number;
  vehicles?: any[];
}

export default function AdminDashboard() {
  const { user, loginWithEmail, signupWithEmail, loginWithGoogle, resetPassword, logout } = useAuth();
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Dashboard State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Add Booking State
  const [isAddingBooking, setIsAddingBooking] = useState(false);

  const adminEmails = ['dritzz.info@gmail.com', 'sujitsinghguw@gmail.com', 'admin@dritzz.info'];
  const userEmail = user?.email?.toLowerCase() || '';
  const isAdmin = adminEmails.some(email => userEmail === email.toLowerCase());

  useEffect(() => {
    if (isAdmin) {
      fetchBookings();
    }
  }, [isAdmin]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    try {
      await loginWithEmail(email, password);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.message.includes('invalid')) {
        try {
          await signupWithEmail(email, password, 'Admin');
          return; // successful signup auto logs in
        } catch (signupErr: any) {
          setLoginError(signupErr.message || 'Failed to initialize admin account.');
          return;
        }
      }
      setLoginError(err.message || 'Failed to login.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const [activeTab, setActiveTab] = useState<'bookings' | 'sub_tasks' | 'subscriptions'>('bookings');
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'bookings'));
      const snapshot = await getDocs(q);
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Booking[];
      
      fetched.sort((a, b) => {
        const da = a.createdAt?.seconds || 0;
        const db = b.createdAt?.seconds || 0;
        return db - da;
      });

      setBookings(fetched);

      const qs = query(collection(db, 'subscriptions'));
      const s_snapshot = await getDocs(qs);
      const fetched_s = s_snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      
      fetched_s.sort((a, b) => {
        const da = a.createdAt?.seconds || 0;
        const db = b.createdAt?.seconds || 0;
        return db - da;
      });

      setSubscriptions(fetched_s);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      alert('Error fetching data: ' + error.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const bRef = doc(db, 'bookings', bookingId);
      
      // If marking as completed, check if it belongs to a subscription
      if (newStatus === 'completed') {
        const booking = bookings.find(b => b.id === bookingId);
        if (booking && booking.subscriptionId) {
          // decrement remaining washes
          const subRef = doc(db, 'subscriptions', booking.subscriptionId);
          // To be perfectly safe we could use a transaction, but standard update is fine for this demo
          // First fetch the sub? Actually we can use a server-side increment or just get it
          const subSnap = await getDocs(query(collection(db, 'subscriptions')));
          const subscription = subSnap.docs.find(d => d.id === booking.subscriptionId)?.data();
          if (subscription && subscription.remainingWashes > 0) {
             await updateDoc(subRef, {
                remainingWashes: subscription.remainingWashes - 1,
                usedWashes: subscription.usedWashes + 1,
                status: subscription.remainingWashes - 1 === 0 ? 'completed' : subscription.status
             });
          }
        }
      }

      await updateDoc(bRef, { status: newStatus });
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      await deleteDoc(doc(db, 'bookings', bookingId));
      setBookings(prev => prev.filter(b => b.id !== bookingId));
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Failed to delete booking');
    }
  };

  const filteredBookings = bookings.filter(b => {
    // Verify booking type matches tab selection
    if (activeTab === 'bookings' && b.packageId === 'monthly') {
      // Exclude subscription tasks from one-time bookings and vice-versa
      return false;
    }
    if (activeTab === 'sub_tasks' && b.packageId !== 'monthly') {
      return false;
    }

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (b.refId || '').toLowerCase().includes(searchLower) ||
           (b.name || '').toLowerCase().includes(searchLower) ||
           (b.email || '').toLowerCase().includes(searchLower) ||
           (b.phone || '').includes(searchTerm);
    
    let matchesDate = true;
    if (filterDate) {
      if (b.createdAt?.toDate) {
        const createdDate = b.createdAt.toDate();
        const createdDateStr = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}-${String(createdDate.getDate()).padStart(2, '0')}`;
        matchesDate = createdDateStr === filterDate;
      } else {
        matchesDate = false;
      }
    }
    
    return matchesSearch && matchesDate;
  });

  const filteredSubscriptions = subscriptions.filter(s => {
    if (s.packageId !== 'monthly') return false;
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (s.customerName || '').toLowerCase().includes(searchLower) ||
           (s.id || '').toLowerCase().includes(searchLower) ||
           (s.customerPhone || '').includes(searchTerm);

    // Also filter by date so Export and Table filters logic matches
    let matchesDate = true;
    if (filterDate) {
      if (s.createdAt?.toDate) {
        const createdDate = s.createdAt.toDate();
        const createdDateStr = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}-${String(createdDate.getDate()).padStart(2, '0')}`;
        matchesDate = createdDateStr === filterDate;
      } else {
        matchesDate = false;
      }
    }

    return matchesSearch && matchesDate;
  });

  const handleDownloadInvoice = async (b: Booking) => {
    const pkg = PACKAGES.find(p => p.id === b.packageId);
    if (!pkg) {
      alert("Package details not found.");
      return;
    }
    const details = {
      name: b.name,
      phone: b.phone,
      email: b.email,
      address: b.address || '',
      date: b.date,
      timeSlot: b.timeSlot,
      vehicleType: b.vehicleType as any,
      packageId: b.packageId,
      vehicles: b.vehicles || [],
      notes: ''
    };
    await generateInvoice(details, pkg, b.amount, b.paymentMethod || 'Manual', b.refId, b.status);
  };

  const handleExportExcel = () => {
    const exportData = filteredBookings.map(b => ({
      'Ref ID': b.refId,
      'Name': b.name,
      'Email': b.email,
      'Phone': b.phone,
      'Address': b.address || '',
      'Vehicle Type': b.vehicles && b.vehicles.length > 0 ? b.vehicles.map(v => v.type).join(', ') : b.vehicleType,
      'Vehicles Count': b.vehicles ? b.vehicles.length : 1,
      'Package': b.packageId,
      'Amount': b.amount,
      'Date': b.date,
      'Time Slot': b.timeSlot,
      'Status': b.status,
      'Payment Method': b.paymentMethod,
      'Created At': b.createdAt?.toDate ? b.createdAt.toDate().toLocaleString() : ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");
    
    const fileName = filterDate ? `bookings_${filterDate}.xlsx` : `all_bookings.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const nonCancelledBookings = bookings.filter(b => b.status !== 'cancelled');
  
  // Quick stats
  const totalBookings = nonCancelledBookings.length;
  const totalRevenue = nonCancelledBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
  const pendingBookings = nonCancelledBookings.filter(b => b.status === 'confirmed').length;

  let displayDateLabel = "Today";
  const dateObj = new Date();
  
  const displayBookingsArr = nonCancelledBookings.filter(b => {
    if (!b.createdAt?.toDate) return false;
    const createdDate = b.createdAt.toDate();
    
    if (filterDate) {
      const createdDateStr = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}-${String(createdDate.getDate()).padStart(2, '0')}`;
      return createdDateStr === filterDate;
    }
    
    return createdDate.getFullYear() === dateObj.getFullYear() &&
           createdDate.getMonth() === dateObj.getMonth() &&
           createdDate.getDate() === dateObj.getDate();
  });
  const displayBookingsCount = displayBookingsArr.length;
  const displayRevenue = displayBookingsArr.reduce((sum, b) => sum + (b.amount || 0), 0);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
        {user ? (
          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center">
            <Lock className="w-12 h-12 text-red-500 mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-neutral-100 text-xs mb-6">You are signed in as {user.email}, which is not an administrator account.</p>
            <button
              onClick={logout}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all text-xs uppercase tracking-wider"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="bg-neutral-900 border border-white/10 rounded-[32px] p-8 max-w-[400px] w-full shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Admin Portal</h1>
              <p className="text-xs text-neutral-300">Authorized personnel only</p>
            </div>

            {loginError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs text-center font-medium">
                {loginError}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-neutral-300" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Admin Email"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-neutral-300" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full h-14 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 group transition-all hover:bg-neutral-200 active:scale-95 disabled:opacity-50 mt-2"
              >
                {isLoggingIn ? 'Authenticating...' : 'Secure Login'}
                <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    if (!email) {
                      setLoginError('Please enter your email to reset password.');
                      return;
                    }
                    setIsResetting(true);
                    setLoginError('');
                    try {
                      await resetPassword(email);
                      setLoginError('Password reset email sent! Check your inbox.');
                    } catch (e: any) {
                      setLoginError(e.message || 'Failed to send reset email.');
                    } finally {
                      setIsResetting(false);
                    }
                  }}
                  className="text-xs text-neutral-100 hover:text-white transition-colors underline-offset-4 hover:underline"
                >
                  {isResetting ? 'Sending...' : 'Forgot password?'}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative py-2 mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-[0.3em] font-bold">
                  <span className="bg-neutral-900 px-4 text-neutral-600">OR</span>
                </div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await loginWithGoogle();
                  } catch (e: any) {
                    setLoginError(e.message || 'Failed to sign in with Google');
                  }
                }}
                className="w-full h-14 bg-white/5 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all hover:bg-white/10 active:scale-95"
              >
                Continue with Google
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans">
      {/* Header */}
      <header className="bg-neutral-900 border-b border-white/5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-neutral-300 hover:text-white transition-colors mr-2">
              ← Home
            </a>
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <h1 className="font-black tracking-tight text-xl">DRITZZ ADMIN</h1>
          </div>
          <button
            onClick={logout}
            className="text-xs font-bold uppercase tracking-wider text-neutral-300 hover:text-white transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-neutral-900 border border-white/5 rounded-3xl p-6">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-neutral-100" />
            </div>
            <p className="text-neutral-300 text-xs font-medium mb-1">{filterDate ? 'Filtered Bookings' : "Today's Bookings"}</p>
            <p className="text-4xl font-black tracking-tighter">{displayBookingsCount}</p>
          </div>
          <div className="bg-neutral-900 border border-white/5 rounded-3xl p-6">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <p className="text-neutral-300 text-xs font-medium mb-1">{filterDate ? 'Filtered Revenue' : "Today's Revenue"}</p>
            <p className="text-4xl font-black tracking-tighter">₹{displayRevenue}</p>
          </div>
          <div className="bg-neutral-900 border border-white/5 rounded-3xl p-6">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-neutral-100" />
            </div>
            <p className="text-neutral-300 text-xs font-medium mb-1">Total Bookings</p>
            <p className="text-4xl font-black tracking-tighter">{totalBookings}</p>
          </div>
          <div className="bg-neutral-900 border border-white/5 rounded-3xl p-6">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <p className="text-neutral-300 text-xs font-medium mb-1">Total Revenue</p>
            <p className="text-4xl font-black tracking-tighter">₹{totalRevenue}</p>
          </div>
          <div className="bg-neutral-900 border border-white/5 rounded-3xl p-6">
            <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-orange-400" />
            </div>
            <p className="text-neutral-300 text-xs font-medium mb-1">Active / Pending</p>
            <p className="text-4xl font-black tracking-tighter">{pendingBookings}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-white/5 w-fit rounded-xl border border-white/10 flex-wrap">
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'bookings' ? 'bg-white text-black' : 'text-neutral-100 hover:text-white'}`}
          >
            One-Time Bookings
          </button>
          <button 
            onClick={() => setActiveTab('sub_tasks')}
            className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'sub_tasks' ? 'bg-orange-500 text-white' : 'text-neutral-100 hover:text-white'}`}
          >
            Subscription Tasks
          </button>
          <button 
            onClick={() => setActiveTab('subscriptions')}
            className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'subscriptions' ? 'bg-zinc-600 text-white' : 'text-neutral-100 hover:text-white'}`}
          >
            Active Subscriptions
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:max-w-[200px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-neutral-900 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-xs focus:outline-none focus:border-white transition-colors"
              />
            </div>

            <div className="relative w-full sm:max-w-[160px]">
              <input
                type="date"
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                className="w-full bg-neutral-900 border border-white/10 rounded-2xl py-3 px-4 text-xs focus:outline-none focus:border-white transition-colors text-white"
                style={{ colorScheme: 'dark' }}
              />
              {filterDate && (
                <button 
                  onClick={() => setFilterDate('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleExportExcel}
              className="flex-1 sm:flex-none px-4 py-3 bg-green-500/10 text-green-400 border border-green-500/20 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-green-500/20 transition-colors flex items-center justify-center gap-2"
              title="Export to Excel"
            >
              <Download className="w-4 h-4" /> <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={() => {
                setIsRefreshing(true);
                fetchBookings();
              }}
              className="flex-1 sm:flex-none px-4 py-3 bg-neutral-900 border border-white/10 text-white rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-white/5 transition-colors shrink-0"
            >
              {isRefreshing ? '...' : 'Refresh'}
            </button>
            <button
              onClick={() => setIsAddingBooking(true)}
              className="flex-1 sm:flex-none px-4 py-3 bg-white text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            {activeTab === 'bookings' || activeTab === 'sub_tasks' ? (
              // Bookings Table
              (loading && bookings.length === 0) ? (
                <div className="p-12 text-center text-neutral-300 text-xs font-medium">Loading bookings...</div>
              ) : filteredBookings.length === 0 ? (
                <div className="p-12 text-center text-neutral-300 text-xs font-medium">No bookings found for this category.</div>
              ) : (
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-white/5 text-neutral-100 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-bold">Ref / Booking Date</th>
                      <th className="px-6 py-4 font-bold">Customer Info</th>
                      <th className="px-6 py-4 font-bold">Service Details</th>
                      <th className="px-6 py-4 font-bold">Slot</th>
                      <th className="px-6 py-4 font-bold">Status</th>
                      <th className="px-6 py-4 font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="font-mono text-xs bg-black/50 px-2 py-1 rounded inline-block text-neutral-300 w-fit">
                              {b.refId}
                            </span>
                            <span className="text-xs text-neutral-300 font-medium tracking-wider">
                              Booked for: {b.date ? new Date(b.date + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                            </span>
                            {b.createdAt && b.createdAt.toDate && (
                              <span className="text-[11px] text-neutral-600 font-medium tracking-wider">
                                Created: {b.createdAt.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-white mb-1">{b.name}</div>
                          <div className="text-xs text-neutral-300 flex flex-col gap-1">
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3"/> {b.email}</span>
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3"/> {b.phone}</span>
                            {b.address && (
                              b.latitude && b.longitude ? (
                                <a
                                  href={`https://www.google.com/maps/dir/?api=1&destination=${b.latitude},${b.longitude}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-start gap-1 mt-1 pt-1 border-t border-white/5 text-[11px] text-white hover:text-neutral-300 max-w-[200px] leading-tight transition-colors cursor-pointer group"
                                  title="Click to get directions on Google Maps"
                                >
                                  <MapPin className="w-3 h-3 text-white shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                                  <span className="line-clamp-2 underline decoration-dashed decoration-zinc-500/30 group-hover:decoration-zinc-400">{b.address}</span>
                                </a>
                              ) : (
                                <span className="flex items-start gap-1 mt-1 pt-1 border-t border-white/5 text-[11px] text-neutral-100 max-w-[200px] leading-tight" title={b.address}>
                                  <MapPin className="w-3 h-3 text-neutral-300 shrink-0 mt-0.5" />
                                  <span className="line-clamp-2">{b.address}</span>
                                </span>
                              )
                            )}
                            {b.latitude && b.longitude && (
                              <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${b.latitude},${b.longitude}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 mt-1 text-xs text-white hover:text-neutral-300 font-bold uppercase tracking-widest bg-zinc-500/10 hover:bg-zinc-500/20 px-2 py-1 rounded transition-all w-fit cursor-pointer"
                              >
                                <Navigation className="w-2.5 h-2.5 text-white animate-pulse" />
                                Get Directions
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Car className="w-4 h-4 text-neutral-100" />
                            <span className="font-medium text-white capitalize">{b.vehicleMake} {b.vehicleModel}</span>
                          </div>
                          <div className="text-xs text-neutral-300 uppercase tracking-wider">
                            {(b.vehicles && b.vehicles.length > 0) ? `${b.vehicles.length} Vehicles` : b.vehicleType} &bull; {b.packageId} &bull; ₹{b.amount}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-neutral-300">
                          <div className="font-medium">{b.date}</div>
                          <div className="text-xs text-neutral-300">{b.timeSlot}</div>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={b.status}
                            onChange={(e) => handleStatusChange(b.id, e.target.value)}
                            className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border-2 appearance-none cursor-pointer outline-none transition-colors
                              ${b.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                                b.status === 'confirmed' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
                                b.status === 'scheduled' ? 'bg-zinc-500/10 text-white border-white/5' : 
                                b.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                                'bg-neutral-800 text-neutral-300 border-neutral-700'}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDownloadInvoice(b)}
                              className="p-2 text-neutral-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                              title="Download Invoice"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteBooking(b.id)}
                              className="p-2 text-neutral-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Delete Booking"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            ) : (
              // Subscriptions Table
              (loading && subscriptions.length === 0) ? (
                <div className="p-12 text-center text-neutral-300 text-xs font-medium">Loading subscriptions...</div>
              ) : filteredSubscriptions.length === 0 ? (
                <div className="p-12 text-center text-neutral-300 text-xs font-medium">No active subscriptions found.</div>
              ) : (
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-white/5 text-neutral-100 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-bold">Details</th>
                      <th className="px-6 py-4 font-bold">Customer Info</th>
                      <th className="px-6 py-4 font-bold">Status & Usage</th>
                      <th className="px-6 py-4 font-bold">Dates</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredSubscriptions.map((s) => {
                      const isExpired = s.expiresAt?.toDate ? new Date() > s.expiresAt.toDate() : false;
                      const activeStatus = isExpired ? 'Expired' : (s.remainingWashes > 0 ? 'Active' : 'Completed');

                      return (
                      <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-white capitalize">{s.packageId || 'Plan'}</div>
                          <div className="text-xs text-neutral-300 uppercase tracking-widest mt-1">
                             {s.vehicles?.length} Vehicle(s)
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-white mb-1">{s.customerName}</div>
                          <div className="text-xs text-neutral-300">
                             {s.customerPhone} <br/>
                             <span className="truncate block max-w-[200px]" title={s.address}>{s.address}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-black uppercase tracking-widest ${activeStatus === 'Active' ? 'bg-zinc-500/20 text-white' : 'bg-red-500/20 text-red-500'}`}>
                             {activeStatus}
                          </span>
                          <div className="text-xs text-neutral-300 mt-2 font-mono">
                             Used: {s.usedWashes} / {s.totalWashes} (Rem: {s.remainingWashes})
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-neutral-100">
                          <div><span className="font-bold">Created:</span> {s.createdAt?.toDate?.()?.toLocaleDateString('en-GB') || 'N/A'}</div>
                          <div><span className="font-bold">Expires:</span> {s.expiresAt?.toDate?.()?.toLocaleDateString('en-GB') || 'N/A'}</div>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              )
            )}
          </div>
        </div>
      </main>

      {/* Add Booking Modal */}
      {isAddingBooking && (
        <AddBookingModal 
          onClose={() => setIsAddingBooking(false)} 
          onAdded={() => {
            setIsAddingBooking(false);
            fetchBookings();
          }}
        />
      )}
    </div>
  );
}

// Separate component for adding bookings manually
function AddBookingModal({ onClose, onAdded }: { onClose: () => void, onAdded: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', vehicleMake: '', vehicleModel: '',
    vehicleType: 'hatchback', packageId: 'basic', date: '', timeSlot: '09:00 AM - 11:00 AM', amount: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const refId = `ADMIN-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
      
      let subscriptionId = null;

      if (formData.packageId === 'monthly') {
        const expiresAtDate = new Date();
        expiresAtDate.setMonth(expiresAtDate.getMonth() + 1);

        const subPayload = {
          userId: 'admin_manual_entry',
          customerName: formData.name,
          customerPhone: formData.phone,
          packageId: 'monthly',
          vehicles: [{
            type: formData.vehicleType,
            make: formData.vehicleMake,
            model: formData.vehicleModel
          }],
          status: 'active',
          totalWashes: 4,
          usedWashes: 0,
          remainingWashes: 4,
          expiresAt: expiresAtDate,
          createdAt: serverTimestamp(),
          paymentId: refId
        };
        
        const subRef = await addDoc(collection(db, 'subscriptions'), subPayload);
        subscriptionId = subRef.id;
      }

      await addDoc(collection(db, 'bookings'), {
        ...formData,
        subscriptionId,
        amount: Number(formData.amount),
        refId,
        status: 'confirmed',
        paymentMethod: formData.packageId === 'monthly' ? 'subscription' : 'manual_admin',
        userId: 'admin_manual_entry',
        createdAt: serverTimestamp()
      });
      onAdded();
    } catch (error) {
      console.error('Error adding booking:', error);
      alert('Failed to add booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-white/10 rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-white/5 flex justify-between items-center sticky top-0 bg-neutral-900 z-10">
          <h2 className="text-xl font-black uppercase tracking-tight">Manual Booking entry</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-neutral-100 uppercase tracking-wider mb-2 block">Name</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-white transition-colors outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-100 uppercase tracking-wider mb-2 block">Email</label>
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-white transition-colors outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-100 uppercase tracking-wider mb-2 block">Phone</label>
              <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-white transition-colors outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-100 uppercase tracking-wider mb-2 block">Amount (₹)</label>
              <input required type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-white transition-colors outline-none" />
            </div>
            
            <div className="md:col-span-2 pt-4 border-t border-white/5">
              <h3 className="text-xs font-bold text-white mb-4">Vehicle Details</h3>
            </div>
            
            <div>
              <label className="text-xs font-bold text-neutral-100 uppercase tracking-wider mb-2 block">Make</label>
              <input required type="text" placeholder="e.g. Maruti Suzuki" value={formData.vehicleMake} onChange={e => setFormData({...formData, vehicleMake: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-white transition-colors outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-100 uppercase tracking-wider mb-2 block">Model</label>
              <input required type="text" placeholder="e.g. Swift" value={formData.vehicleModel} onChange={e => setFormData({...formData, vehicleModel: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-white transition-colors outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-100 uppercase tracking-wider mb-2 block">Type</label>
              <select value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value})} className="w-full bg-white/10 border border-white/20 px-4 py-3.5 text-xs font-medium focus:border-neutral-500/50 focus:ring-1 focus:ring-zinc-500/50 outline-none transition-all appearance-none rounded-xl text-white shadow-sm">
                <option value="hatchback">Hatchback</option>
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-100 uppercase tracking-wider mb-2 block">Package</label>
              <select value={formData.packageId} onChange={e => setFormData({...formData, packageId: e.target.value})} className="w-full bg-white/10 border border-white/20 px-4 py-3.5 text-xs font-medium focus:border-neutral-500/50 focus:ring-1 focus:ring-zinc-500/50 outline-none transition-all appearance-none rounded-xl text-white shadow-sm">
                <option value="basic">Basic Wash</option>
                <option value="premium">Premium Care</option>
                <option value="monthly">Monthly Care</option>
              </select>
            </div>

            <div className="md:col-span-2 pt-4 border-t border-white/5">
              <h3 className="text-xs font-bold text-white mb-4">Schedule</h3>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-100 uppercase tracking-wider mb-2 block">Date</label>
              <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-white transition-colors outline-none" style={{ colorScheme: 'dark' }} />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-100 uppercase tracking-wider mb-2 block">Time Slot</label>
              <select value={formData.timeSlot} onChange={e => setFormData({...formData, timeSlot: e.target.value})} className="w-full bg-white/10 border border-white/20 px-4 py-3.5 text-xs font-medium focus:border-neutral-500/50 focus:ring-1 focus:ring-zinc-500/50 outline-none transition-all appearance-none rounded-xl text-white shadow-sm">
                {['09:00 AM - 11:00 AM', '11:00 AM - 01:00 PM', '01:00 PM - 03:00 PM', '03:00 PM - 05:00 PM', '05:00 PM - 07:00 PM'].map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="pt-6">
            <button type="submit" disabled={loading} className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50">
              {loading ? 'Adding...' : 'Add Booking manually'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
