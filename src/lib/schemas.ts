import { z } from "zod";

/* ============================================
   Shared enums
   ============================================ */

export const ContactReasonSchema = z.enum([
  "general",
  "new",
  "transfer",
  "refill",
  "rpm",
]);

export const WaitlistStatusSchema = z.enum([
  "active",
  "contacted",
  "enrolled",
]);

export const ServicePreferenceSchema = z.enum([
  "pickup",
  "delivery",
]);

/* Simple helpers */

const phoneSchema = z
  .string()
  .min(7, "Phone number is too short")
  .max(30, "Phone number is too long");

const emailSchema = z
  .string()
  .email("Invalid email address");

/* ============================================
   ContactFormData
   ============================================ */

export const ContactFormDataSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: phoneSchema,
  email: emailSchema,
  reason: ContactReasonSchema,
  message: z.string().min(1, "Message is required"),
  consent: z.boolean(),
});

export type ContactFormData = z.infer<typeof ContactFormDataSchema>;

/* ============================================
   WaitlistFormData & WaitlistEntry
   ============================================ */

export const WaitlistFormDataSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: emailSchema,
  phone: phoneSchema,
});

export type WaitlistFormData = z.infer<typeof WaitlistFormDataSchema>;

export const WaitlistEntrySchema = WaitlistFormDataSchema.extend({
  id: z.string().uuid(),
  timestamp: z.string(),
  status: WaitlistStatusSchema,
});

export type WaitlistEntry = z.infer<typeof WaitlistEntrySchema>;

/* ============================================
   RefillFormData
   ============================================ */

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

export const RefillFormDataSchema = z.object({
  patientName: z.string().min(1, "Patient name is required"),
  dob: dateStringSchema,
  phone: phoneSchema,
  email: emailSchema.optional().or(z.literal("").transform(() => undefined)),
  prescriptionNumbers: z.string().min(1, "Prescription numbers are required"),
  medicationNames: z.string().min(1, "Medication names are required"),
  preferredService: ServicePreferenceSchema,
  notes: z.string().optional(),
  consent: z.boolean(),
});

export type RefillFormData = z.infer<typeof RefillFormDataSchema>;

/* ============================================
   TransferFormData
   ============================================ */

export const TransferFormDataSchema = z.object({
  rxNumber: z.string().min(1, "Rx number is required"),
  rxFillDate: dateStringSchema,

  transferToPharmacyName: z.string().min(1),
  transferToPharmacyAddress1: z.string().min(1),
  transferToPharmacyAddress2: z.string().optional(),
  transferToPharmacyCity: z.string().min(1),
  transferToPharmacyState: z.string().min(2),
  transferToPharmacyZip: z.string().min(3),
  transferToPharmacyPhone: phoneSchema,
  transferToPharmacyNCPDP: z.string().optional(),

  transferRxRemark: z.string().optional(),
  consent: z.boolean(),
});

export type TransferFormData = z.infer<typeof TransferFormDataSchema>;

/* ============================================
   SplashModalFormData
   ============================================ */

export const SplashModalFormDataSchema = z.object({
  email: emailSchema,
});

export type SplashModalFormData = z.infer<typeof SplashModalFormDataSchema>;
