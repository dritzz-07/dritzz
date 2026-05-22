import { Package } from './types';

export const PACKAGES: Package[] = [
  {
    id: 'basic',
    name: 'Basic Wash',
    tagline: 'Quick exterior refresh',
    price: {
      hatchback: 349,
      sedan: 449,
      suv: 549,
      muv: 549
    },
    icon: 'Droplets',
    features: [
      'Exterior Foam Wash',
      'Interior Vacuum',
      'Dashboard Cleaning',
      'Tyre Cleaning',
      'Doorstep Service',
      'Water Efficient Cleaning'
    ]
  },
  {
    id: 'mid',
    name: 'Premium Wash',
    tagline: 'Inside & out, spotless',
    price: {
      hatchback: 799,
      sedan: 899,
      suv: 1099,
      muv: 1099
    },
    icon: 'Sparkles',
    features: [
      'Exterior Foam Wash',
      'Interior Vacuum',
      'Dashboard Cleaning',
      'Tyre Cleaning',
      'Doorstep Service',
      'Water Efficient Cleaning'
    ],
    featured: true
  },
  {
    id: 'premium',
    name: 'Monthly Plan',
    tagline: '4 Washes Monthly',
    price: {
      hatchback: 2199,
      sedan: 2599,
      suv: 2999,
      muv: 2999
    },
    icon: 'Gem',
    features: [
      'Exterior Foam Wash',
      'Interior Vacuum',
      'Dashboard Cleaning',
      'Tyre Cleaning',
      'Doorstep Service',
      'Water Efficient Cleaning'
    ]
  }
];

export const TIME_SLOTS = [
  '8:00 AM – 10:00 AM',
  '10:00 AM – 12:00 PM',
  '12:00 PM – 2:00 PM',
  '2:00 PM – 4:00 PM',
  '4:00 PM – 6:00 PM'
];
