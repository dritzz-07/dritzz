import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Banknote, QrCode, Download, CheckCircle2, ChevronRight, X, Wallet } from 'lucide-react';
import { BookingDetails, Package } from '../types';
import { generateInvoice } from '../lib/pdf';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getApiUrl } from '../lib/api';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingDetails: BookingDetails | null;
  pkg: Package | null;
  amount: number;
}

export default function PaymentModal({ isOpen, onClose, bookingDetails, pkg, amount }: PaymentModalProps) {
  const [step, setStep] = useState<'method' | 'success'>('method');
  const [method, setMethod] = useState<'cash' | 'upi' | 'stripe' | 'paypal'>('upi');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const refId = `DRZ-${Date.now().toString().slice(-6)}`;

  const handleConfirm = async () => {
    if (!bookingDetails || !pkg) return;
    
    setIsLoading(true);
    try {
      // 1. Save to Firestore
      await addDoc(collection(db, 'bookings'), {
        ...bookingDetails,
        amount,
        refId,
        paymentMethod: method,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // 2. Send SMS Confirmation (existing logic)
      try {
        await fetch(getApiUrl('/api/send-confirmation'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: bookingDetails.name,
            phone: bookingDetails.phone,
            packageName: pkg.name,
            amount: amount,
            refId: refId
          })
        });
      } catch (smsError) {
        console.warn('SMS notification failed to send, but booking has been successfully saved:', smsError);
      }

      setStep('success');
    } catch (error: any) {
      console.error('Failed to complete booking:', error);
      alert('Failed to save booking. Check console. ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!bookingDetails || !pkg) return;
    setIsGenerating(true);
    try {
      await generateInvoice(bookingDetails, pkg, amount, method, refId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-neutral-900 border border-white/10 w-full max-w-xl overflow-hidden rounded-3xl shadow-[0_0_100px_-20px_rgba(255,255,255,0.15)]"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <div>
                <h3 className="text-white font-bold text-xl tracking-tight">
                  {step === 'method' ? 'Choose Payment Method' : 'Booking Successful'}
                </h3>
                <p className="text-neutral-500 text-xs font-medium uppercase tracking-widest mt-1">
                  Reference: {refId}
                </p>
              </div>
              {step === 'method' && (
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-neutral-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="p-8 md:p-10">
              {step === 'method' ? (
                <div className="space-y-8">
                  {/* Summary Card */}
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-neutral-500 uppercase tracking-widest font-bold text-[10px]">Package</span>
                      <span className="text-white font-medium">{pkg?.name}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-neutral-500 uppercase tracking-widest font-bold text-[10px]">Total Amount</span>
                      <span className="text-white font-black text-2xl tracking-tighter">₹{amount}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      onClick={() => setMethod('upi')}
                      className={`relative p-5 border rounded-2xl transition-all text-left ${
                        method === 'upi' 
                          ? 'bg-white border-white shadow-[0_10px_30px_rgba(255,255,255,0.2)]' 
                          : 'bg-white/5 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <QrCode className={`w-6 h-6 mb-3 ${method === 'upi' ? 'text-black' : 'text-white'}`} />
                      <div className={`text-[10px] font-bold uppercase tracking-widest ${method === 'upi' ? 'text-black' : 'text-white'}`}>UPI Payment</div>
                      {method === 'upi' && (
                        <div className="absolute top-3 right-3 w-4 h-4 bg-black rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </button>

                    <button
                      onClick={() => setMethod('stripe')}
                      className={`relative p-5 border rounded-2xl transition-all text-left ${
                        method === 'stripe' 
                          ? 'bg-white border-white shadow-[0_10px_30px_rgba(255,255,255,0.2)]' 
                          : 'bg-white/5 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <CreditCard className={`w-6 h-6 mb-3 ${method === 'stripe' ? 'text-black' : 'text-white'}`} />
                      <div className={`text-[10px] font-bold uppercase tracking-widest ${method === 'stripe' ? 'text-black' : 'text-white'}`}>Stripe / Card</div>
                      {method === 'stripe' && (
                        <div className="absolute top-3 right-3 w-4 h-4 bg-black rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </button>

                    <button
                      onClick={() => setMethod('paypal')}
                      className={`relative p-5 border rounded-2xl transition-all text-left ${
                        method === 'paypal' 
                          ? 'bg-white border-white shadow-[0_10px_30px_rgba(255,255,255,0.2)]' 
                          : 'bg-white/5 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <Wallet className={`w-6 h-6 mb-3 ${method === 'paypal' ? 'text-black' : 'text-white'}`} />
                      <div className={`text-[10px] font-bold uppercase tracking-widest ${method === 'paypal' ? 'text-black' : 'text-white'}`}>PayPal</div>
                      {method === 'paypal' && (
                        <div className="absolute top-3 right-3 w-4 h-4 bg-black rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </button>

                    <button
                      onClick={() => setMethod('cash')}
                      className={`relative p-5 border rounded-2xl transition-all text-left ${
                        method === 'cash' 
                          ? 'bg-white border-white shadow-[0_10px_30px_rgba(255,255,255,0.2)]' 
                          : 'bg-white/5 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <Banknote className={`w-6 h-6 mb-3 ${method === 'cash' ? 'text-black' : 'text-white'}`} />
                      <div className={`text-[10px] font-bold uppercase tracking-widest ${method === 'cash' ? 'text-black' : 'text-white'}`}>Cash on Delivery</div>
                      {method === 'cash' && (
                        <div className="absolute top-3 right-3 w-4 h-4 bg-black rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </button>
                  </div>

                  <button
                    onClick={handleConfirm}
                    disabled={isLoading}
                    className="w-full bg-white text-black py-5 rounded-2xl font-bold text-sm tracking-widest uppercase hover:brightness-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      <>Confirm Order <ChevronRight className="w-5 h-5" /></>
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="mb-8 flex justify-center">
                    <img src="/logo_v2.svg" alt="Dritzz Logo" className="h-10 w-auto" />
                  </div>
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_-10px_rgba(255,255,255,0.4)]">
                    <CheckCircle2 className="w-10 h-10 text-black" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase">Awesome!</h3>
                  <p className="text-neutral-400 mb-12 max-w-sm mx-auto leading-relaxed">
                    Your car wash is scheduled. We've sent the details to {bookingDetails?.phone}.
                  </p>

                  <div className="space-y-4">
                    <button
                      onClick={handleDownloadInvoice}
                      disabled={isGenerating}
                      className="w-full bg-white/5 border border-white/10 text-white py-5 rounded-2xl font-bold text-sm tracking-widest uppercase hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                    >
                      {isGenerating ? (
                        <>Generating Bill...</>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          Download Invoice
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={onClose}
                      className="w-full text-neutral-500 hover:text-white py-4 rounded-2xl font-bold text-[10px] tracking-[0.3em] uppercase transition-all"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
