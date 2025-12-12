export interface ContactFormData {
  name: string;
  phone: string;
  email: string;
  reason: 'general' | 'new' | 'transfer' | 'refill' | 'rpm';
  message: string;
  consent: boolean;
}

export interface WaitlistFormData {
  name: string;
  email: string;
  phone: string;
}

export interface WaitlistEntry extends WaitlistFormData {
  id: string;
  timestamp: string;
  status: 'active' | 'contacted' | 'enrolled';
}

export interface RefillFormData {
  patientName: string;
  dob: string;
  phone: string;
  email: string;
  prescriptionNumbers: string;
  medicationNames: string;
  preferredService: 'pickup' | 'delivery';
  notes: string;
  consent: boolean;
}

export interface TransferFormData {
  // Fields to identify the prescription at the source pharmacy (Elevated Wellness)
  rxNumber: string;
  rxFillDate: string;

  // Fields for the destination pharmacy
  transferToPharmacyName: string;
  transferToPharmacyAddress1: string;
  transferToPharmacyAddress2: string; // Optional
  transferToPharmacyCity: string;
  transferToPharmacyState: string;
  transferToPharmacyZip: string;
  transferToPharmacyPhone: string;
  transferToPharmacyNCPDP: string; // Optional but good to have

  // Additional transfer details
  transferRxRemark: string; // Optional reason for transfer
  consent: boolean;
}

export interface SplashModalFormData {
  email: string;
}
