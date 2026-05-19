export type VehicleType = 'hatchback' | 'sedan' | 'suv';

export interface Package {
  id: string;
  name: string;
  tagline: string;
  price: Record<VehicleType, number>;
  icon: string;
  features: string[];
  featured?: boolean;
}

export interface BookingDetails {
  userId?: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  date: string;
  timeSlot: string;
  vehicleType: VehicleType;
  packageId: string;
  notes: string;
}
