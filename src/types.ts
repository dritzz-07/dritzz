export type VehicleType = 'hatchback' | 'sedan' | 'suv' | 'muv';

export interface Package {
  id: string;
  name: string;
  tagline: string;
  price: Record<VehicleType, number>;
  icon: string;
  features: string[];
  featured?: boolean;
}

export interface SavedVehicle {
  id: string;
  userId: string;
  type: VehicleType;
  brand: string;
  model: string;
  vehicleNumber: string;
  color: string;
  parkingSlot: string;
  society: string;
  isDefault?: boolean;
}

export interface SelectedVehicleForBooking {
  vehicleId?: string; // id of saved vehicle or just custom
  type: VehicleType;
  brand?: string;
  model?: string;
  vehicleNumber?: string;
  color?: string;
  date: string;
  timeSlot: string;
  packageId: string;
  price: number;
}

export interface BookingDetails {
  userId?: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  // single legacy fields
  date?: string;
  timeSlot?: string;
  vehicleType?: VehicleType;
  packageId?: string;
  // multi vehicle booking
  vehicles: SelectedVehicleForBooking[];
  notes: string;
  latitude?: number;
  longitude?: number;
  amount?: number;
}
