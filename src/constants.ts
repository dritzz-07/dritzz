import { Package } from './types';

export const PACKAGES: Package[] = [
  {
    id: 'basic',
    name: 'Basic Care',
    tagline: 'Affordable Quick Wash',
    price: {
      hatchback: 499,
      sedan: 499,
      suv: 599,
      muv: 599
    },
    icon: 'Droplets',
    features: [
      'Exterior Foam Wash',
      'Tyre Cleaning & Shine',
      'Doorstep Service'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Care',
    tagline: 'Complete Interior + Exterior Care',
    price: {
      hatchback: 699,
      sedan: 699,
      suv: 799,
      muv: 799
    },
    icon: 'Sparkles',
    features: [
      'Exterior Foam Wash',
      'Interior Vacuum',
      'Dashboard Cleaning',
      'Tyre Cleaning & Shine',
      'Doorstep Service'
    ],
    featured: false // We will handle featured badge in UI for Premium
  },
  {
    id: 'monthly',
    name: 'Monthly Care',
    tagline: 'Smart Car Owners Choose Monthly Care',
    price: {
      hatchback: 1999,
      sedan: 1999,
      suv: 2499,
      muv: 2499
    },
    icon: 'Gem',
    features: [
      '4 Washes Every Month',
      'Exterior Foam Wash',
      'Interior Vacuum',
      'Dashboard Cleaning',
      'Tyre Cleaning & Shine',
      'Priority Booking'
    ],
    featured: true // To be highlighted
  }
];

export const TIME_SLOTS = [
  '8:00 AM – 10:00 AM',
  '10:00 AM – 12:00 PM',
  '12:00 PM – 2:00 PM',
  '2:00 PM – 4:00 PM',
  '4:00 PM – 6:00 PM'
];
