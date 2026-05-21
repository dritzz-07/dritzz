import { Package } from './types';

export const PACKAGES: Package[] = [
  {
    id: 'basic',
    name: 'DRITZZ BASIC',
    tagline: 'Quick exterior refresh',
    price: {
      hatchback: 299,
      sedan: 349,
      suv: 449,
      muv: 449
    },
    icon: 'Droplets',
    features: [
      'Exterior hand wash',
      'Wheel & tyre clean',
      'Window wipe',
      'Door sill wipe',
      'Air freshener'
    ]
  },
  {
    id: 'mid',
    name: 'DRITZZ PREMIUM',
    tagline: 'Inside & out, spotless',
    price: {
      hatchback: 799,
      sedan: 932,
      suv: 1132,
      muv: 1132
    },
    icon: 'Sparkles',
    features: [
      'Full exterior wash',
      'Interior vacuum',
      'Dashboard wipe',
      'Glass cleaning inside & out',
      'Tyre dressing',
      'Air freshener'
    ],
    featured: true
  },
  {
    id: 'premium',
    name: 'DRITZZ MONTHLY SERVICE',
    tagline: '3 washes monthly',
    price: {
      hatchback: 1999,
      sedan: 2399,
      suv: 2665,
      muv: 2665
    },
    icon: 'Gem',
    features: [
      'Everything in DRITZZ PREMIUM',
      'Foam wash',
      'Seat shampooing',
      'Engine bay clean',
      'Wax polish coat',
      'Odour treatment',
      'Rubber & plastic conditioning'
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
