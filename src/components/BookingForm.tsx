import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Lock, ChevronRight, MapPin, Navigation, Loader2 } from 'lucide-react';
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

  const [showMapPicker, setShowMapPicker] = useState(false);
  const [locating, setLocating] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  const pickerMapContainerRef = useRef<HTMLDivElement>(null);
  const pickerMapRef = useRef<any>(null);
  const pickerMarkerRef = useRef<any>(null);

  // Clean map on unmount
  useEffect(() => {
    return () => {
      if (pickerMapRef.current) {
        pickerMapRef.current.remove();
        pickerMapRef.current = null;
      }
    };
  }, []);

  // Clean map if toggled off
  useEffect(() => {
    if (!showMapPicker && pickerMapRef.current) {
      pickerMapRef.current.remove();
      pickerMapRef.current = null;
      pickerMarkerRef.current = null;
    }
  }, [showMapPicker]);

  const handleGetLiveLocation = () => {
    setLocating(true);
    setMapError(null);
    setShowMapPicker(true);

    if (!navigator.geolocation) {
      setMapError('Geolocation is not supported by your browser.');
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setDetails(prev => ({ ...prev, latitude, longitude }));

        // Load Leaftlet dynamic and center map
        loadLeafletAndCentremap(latitude, longitude);

        // Fetch reverse geocode address
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              setDetails(prev => ({ ...prev, address: data.display_name }));
            }
          }
        } catch (err) {
          console.error('Error reverse geocoding:', err);
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        let msg = 'Failed to retrieve your location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Please grant location permission in your device/browser settings.';
        }
        setMapError(msg);
        setLocating(false);
        // Fallback to center Hyderabad city centre
        loadLeafletAndCentremap(17.3850, 78.4867);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const loadLeafletAndCentremap = (lat: number, lng: number) => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!(window as any).L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => {
        setLeafletLoaded(true);
        initPickerMap(lat, lng);
      };
      document.body.appendChild(script);
    } else {
      setLeafletLoaded(true);
      initPickerMap(lat, lng);
    }
  };

  const initPickerMap = (lat: number, lng: number) => {
    setTimeout(() => {
      const L = (window as any).L;
      if (!L || !pickerMapContainerRef.current) return;

      if (pickerMapRef.current) {
        pickerMapRef.current.setView([lat, lng], 16);
        if (pickerMarkerRef.current) {
          pickerMarkerRef.current.setLatLng([lat, lng]);
        } else {
          addMarkerToMap(L, lat, lng);
        }
        return;
      }

      pickerMapRef.current = L.map(pickerMapContainerRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView([lat, lng], 16);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20
      }).addTo(pickerMapRef.current);

      addMarkerToMap(L, lat, lng);

      pickerMapRef.current.on('click', async (e: any) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        setDetails(prev => ({ ...prev, latitude: clickLat, longitude: clickLng }));
        if (pickerMarkerRef.current) {
          pickerMarkerRef.current.setLatLng([clickLat, clickLng]);
        }

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${clickLat}&lon=${clickLng}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              setDetails(prev => ({ ...prev, address: data.display_name }));
            }
          }
        } catch (err) {
          console.error(err);
        }
      });
    }, 100);
  };

  const addMarkerToMap = (L: any, lat: number, lng: number) => {
    const customIcon = L.divIcon({
      className: 'custom-pin-icon',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;">
          <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background-color: rgba(16, 185, 129, 0.2); border: 2px solid rgb(16, 185, 129); animation: ping 1.5s infinite; opacity: 0.6;"></div>
          <div style="position: relative; width: 14px; height: 14px; border-radius: 50%; background-color: rgb(16, 185, 129); border: 2px solid white; box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);"></div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    pickerMarkerRef.current = L.marker([lat, lng], {
      icon: customIcon,
      draggable: true
    }).addTo(pickerMapRef.current);

    pickerMarkerRef.current.on('dragend', async (e: any) => {
      const position = e.target.getLatLng();
      const dragLat = position.lat;
      const dragLng = position.lng;
      setDetails(prev => ({ ...prev, latitude: dragLat, longitude: dragLng }));

      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${dragLat}&lon=${dragLng}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.display_name) {
            setDetails(prev => ({ ...prev, address: data.display_name }));
          }
        }
      } catch (err) {
        console.error(err);
      }
    });
  };

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

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold block">Service Address</label>
              <button
                type="button"
                onClick={handleGetLiveLocation}
                className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-black uppercase tracking-wider bg-emerald-500/10 hover:bg-emerald-500/25 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition-all cursor-pointer shrink-0"
              >
                {locating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Locating...
                  </>
                ) : (
                  <>
                    <Navigation className="w-3.5 h-3.5 animate-pulse" />
                    Detect Live Location
                  </>
                )}
              </button>
            </div>
            
            <input
              required
              type="text"
              name="address"
              value={details.address}
              onChange={handleChange}
              placeholder="Flat no, Building, Area, Hyderabad"
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-white outline-none transition-colors rounded-lg text-white"
            />

            {showMapPicker && (
              <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5 p-4 space-y-3">
                <div className="flex justify-between items-center mr-1">
                  <div className="text-[10px] uppercase font-black text-emerald-400 tracking-wider flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Drag Pin or Click Map To Adjust Destination Location
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMapPicker(false)}
                    className="text-neutral-400 hover:text-white text-xs font-bold"
                  >
                    Hide Map
                  </button>
                </div>
                
                <div 
                  ref={pickerMapContainerRef} 
                  className="w-full h-48 sm:h-56 rounded-lg bg-black/40 border border-white/5 overflow-hidden" 
                  id="picker-map"
                />
                
                {details.latitude && details.longitude && (
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 bg-black/20 px-3 py-2 rounded-lg">
                    <span className="text-neutral-500">GPS Coords: <span className="text-neutral-300">{details.latitude.toFixed(6)}, {details.longitude.toFixed(6)}</span></span>
                    <span className="text-emerald-400 uppercase font-bold text-[9px] tracking-wide">Coordinates Locked</span>
                  </div>
                )}
                {mapError && (
                  <div className="text-xs text-red-400 font-medium">{mapError}</div>
                )}
              </div>
            )}
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
