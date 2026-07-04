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

// PRICING (final)
// MRP anchor:      Rs 3,499 (crossed out on site)
// Selling / COD:   Rs 2,000
// UPI prepaid:     Rs 1,900 (Rs 100 off selling)
// Partial COD:     Rs 299 online + Rs 1,701 cash = Rs 2,000
export const PAYMENT = {
  mrp:            3499,
  fullPrice:      2000,
  prepaidPrice:   1900,
  prepaidSavings: 100,
  codDeposit:     299,     // low deposit lowers COD friction, keeps intent
  codRemaining:   1701,    // fullPrice - codDeposit
};

export const SIZES = ['XS','S','M','L','XL','XXL'] as const;
