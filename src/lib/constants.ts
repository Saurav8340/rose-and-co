export const SITE = {
  name: 'Rose & Co',
  tagline: 'Small-batch co-ord sets. Hand-painted prints.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  email: 'care@roseandco.in',
  address: 'Gurugram, Haryana, India',
  instagram: 'https://instagram.com/roseandco',
};

export const UPI = {
  id:   process.env.NEXT_PUBLIC_UPI_ID || 'powernutrition@nyes',
  name: process.env.NEXT_PUBLIC_UPI_PAYEE_NAME || 'Rose And Co',
};

// PRICING
export const PAYMENT = {
  fullPrice:      1499,
  prepaidPrice:   1399,
  prepaidSavings: 100,
  codDeposit:     299,
  codRemaining:   1200,
};

export const SIZES = ['XS','S','M','L','XL','XXL'] as const;
