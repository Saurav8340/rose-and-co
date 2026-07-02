import { z } from 'zod';

export const mobileSchema  = z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit Indian mobile');
export const pincodeSchema = z.string().regex(/^[1-9]\d{5}$/, 'Enter valid 6-digit PIN');

export const captchaVerifySchema = z.object({
  token:  z.string().min(10),
  code:   z.string().min(4).max(8),
  mobile: mobileSchema,
});

export const orderSchema = z.object({
  verificationToken: z.string().min(10),
  fullName:      z.string().min(2).max(80),
  mobile:        mobileSchema,
  email:         z.string().email().optional().or(z.literal('')),
  altPhone:      z.string().optional().or(z.literal('')),
  pincode:       pincodeSchema,
  state:         z.string().min(2).max(60),
  city:          z.string().min(2).max(60),
  addressLine1:  z.string().min(5).max(200),
  addressLine2:  z.string().optional().or(z.literal('')),
  landmark:      z.string().optional().or(z.literal('')),
  paymentMethod: z.enum(['PREPAID', 'PARTIAL_COD']),
  size:          z.enum(['XS','S','M','L','XL','XXL']),
  quantity:      z.number().int().min(1).max(5),
  productId:     z.string().min(5),
  paidConfirmed: z.boolean(),
  metaFbc:       z.string().optional().or(z.literal('')),
  metaFbp:       z.string().optional().or(z.literal('')),
  utm:           z.string().max(500).optional().or(z.literal('')),
  website:       z.string().optional().or(z.literal('')),  // honeypot
  startedAt:     z.number().int().positive(),
});

export type OrderInput = z.infer<typeof orderSchema>;
