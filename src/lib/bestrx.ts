/**
 * BestRX API utility functions
 * Handles payload construction, API calls, and error handling for BestRX integration
 */

import type { RefillFormData, TransferFormData } from './schemas';

// BestRX API Endpoints
export const BESTRX_ENDPOINTS = {
  refill: 'https://webservice.bcsbestrx.com/bcswebservice/v2/webrefillservice/SendRefillRequest',
  transfer: 'https://dataservice.bestrxconnect.com/prescription/submitrxtransferrequest',
} as const;

// BestRX Error Code Mappings
export const BESTRX_ERROR_CODES: Record<string, string> = {
  // Refill errors
  'ERROR_INVALID_PHARMACY': 'Invalid pharmacy number. Please verify your pharmacy details.',
  'ERROR_INVALID_PATIENT': 'Patient information not found. Please verify your name and date of birth.',
  'ERROR_RX_NOT_FOUND': 'One or more prescription numbers were not found. Please verify the numbers.',
  'ERROR_RX_INACTIVE': 'One or more prescriptions are no longer active. Please contact us for assistance.',
  'ERROR_RX_REFILLED': 'One or more prescriptions have already been refilled recently.',
  'ERROR_GENERIC': 'An error occurred while processing your request. Please try again.',
  
  // Transfer errors
  'ERROR0027': 'Prescription not found. Please verify the prescription number.',
  'ERROR0069': 'Prescription cannot be transferred. Please contact the pharmacy.',
  'ERROR0070': 'Invalid destination pharmacy information.',
  'ERROR0080': 'Patient not found in system.',
  'ERROR0003': 'Patient date of birth does not match.',
  'ERROR0082': 'Transfer limit exceeded. Please try again later.',
};

/**
 * Formats phone number to match BestRX requirements (remove non-numeric)
 */
export function formatPhoneForBestRX(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Constructs payload for BestRX Refill Request
 * For endpoint: https://webservice.bcsbestrx.com/bcswebservice/v2/webrefillservice/SendRefillRequest
 */
export function buildRefillRequestPayload(
  formData: RefillFormData,
  pharmacyNumber: string,
  apiKey: string,
  username: string
): Record<string, unknown> {
  // Parse prescription numbers and medication names
  const rxNumbers = formData.prescriptionNumbers
    .split(',')
    .map((num: string) => num.trim())
    .filter((num: string) => num.length > 0);

  const medications = formData.medicationNames
    .split(',')
    .map((name: string) => name.trim())
    .filter((name: string) => name.length > 0);

  // Build RxInRefillRequest array
  const rxInRefillRequest = rxNumbers.map((rxNumber: string, index: number) => ({
    RxNumber: rxNumber,
    MedicationName: medications[index] || '',
  }));

  return {
    userName: username,
    APIKey: apiKey,
    PharmacyNumber: pharmacyNumber,
    LastName: formData.patientName.split(' ').pop() || formData.patientName,
    DOB: formData.dob, // Expected format: YYYY-MM-DD
    Phone: formatPhoneForBestRX(formData.phone),
    DeliveryOption: formData.preferredService || 'Pickup',
    RxInRefillRequest: rxInRefillRequest,
  };
}

/**
 * Constructs payload for BestRX Transfer Request
 * For endpoint: https://dataservice.bestrxconnect.com/prescription/submitrxtransferrequest
 */
export function buildTransferRequestPayload(
  formData: TransferFormData,
  pharmacyNumber: string
): Record<string, unknown> {
  // Parse date for BestRX (YYYY-MM-DD format)
  const transferDate = new Date().toISOString().split('T')[0];

  return {
    PharmacyNumber: pharmacyNumber,
    RxNo: formData.rxNumber,
    RxFillDate: formData.rxFillDate, // Expected format: YYYY-MM-DD
    TransferToPharmacy: {
      Name: formData.transferToPharmacyName,
      Address: formData.transferToPharmacyAddress1,
      Address2: formData.transferToPharmacyAddress2 || '',
      City: formData.transferToPharmacyCity,
      State: formData.transferToPharmacyState,
      Zip: formData.transferToPharmacyZip,
      Phone: formatPhoneForBestRX(formData.transferToPharmacyPhone),
      NCPDP: formData.transferToPharmacyNCPDP || '',
    },
    TransferDate: transferDate,
    Comments: formData.transferRxRemark || '',
  };
}

/**
 * Constructs Basic Auth header for BestRX Transfer Request
 */
export function buildBasicAuthHeader(username: string, password: string): string {
  const credentials = `${username}:${password}`;
  return `Basic ${btoa(credentials)}`;
}

/**
 * Maps BestRX error codes to user-friendly messages
 */
export function mapBestRXError(errorCode: string | undefined, httpStatus?: number): string {
  if (!errorCode) {
    if (httpStatus === 400) return 'Invalid request. Please check your information and try again.';
    if (httpStatus === 403) return 'Authentication failed. Please contact support.';
    if (httpStatus === 500) return 'Service temporarily unavailable. Please try again later.';
    return BESTRX_ERROR_CODES['ERROR_GENERIC'];
  }

  return BESTRX_ERROR_CODES[errorCode] || BESTRX_ERROR_CODES['ERROR_GENERIC'];
}

/**
 * Validates BestRX Refill Response
 */
export function validateRefillResponse(response: unknown): boolean {
  if (!response || typeof response !== 'object') return false;

  const data = response as Record<string, unknown>;
  const rxResponses = data.RxInRefillResponse;

  if (!Array.isArray(rxResponses)) return false;

  // Check if at least one prescription was successfully processed
  return rxResponses.some(
    (rx: unknown) =>
      typeof rx === 'object' &&
      rx !== null &&
      (rx as Record<string, unknown>).Status === 'OK'
  );
}

/**
 * Validates BestRX Transfer Response
 */
export function validateTransferResponse(response: unknown): boolean {
  if (!response || typeof response !== 'object') return false;

  const data = response as Record<string, unknown>;
  return data.IsValid === true && data.RxTransferred === true;
}

/**
 * Extracts error message from BestRX Refill Response
 */
export function extractRefillErrorMessage(response: unknown): string | null {
  if (!response || typeof response !== 'object') return null;

  const data = response as Record<string, unknown>;
  const rxResponses = data.RxInRefillResponse;

  if (Array.isArray(rxResponses) && rxResponses.length > 0) {
    const firstError = rxResponses.find(
      (rx: unknown) =>
        typeof rx === 'object' &&
        rx !== null &&
        (rx as Record<string, unknown>).Status !== 'OK'
    );

    if (firstError && typeof firstError === 'object') {
      const errorCode = (firstError as Record<string, unknown>).ErrorCode;
      const errorMessage = (firstError as Record<string, unknown>).ErrorMessage;

      if (errorCode) {
        return mapBestRXError(String(errorCode));
      }
      if (errorMessage) {
        return String(errorMessage);
      }
    }
  }

  return null;
}

/**
 * Extracts error message from BestRX Transfer Response
 */
export function extractTransferErrorMessage(response: unknown): string | null {
  if (!response || typeof response !== 'object') return null;

  const data = response as Record<string, unknown>;
  const errorCode = data.ErrorCode as string | undefined;
  const errorMessage = data.ErrorMessage as string | undefined;

  if (errorCode) {
    return mapBestRXError(errorCode);
  }
  if (errorMessage) {
    return errorMessage;
  }

  return mapBestRXError(undefined);
}

/**
 * Makes a BestRX Refill Request
 * Note: This should ideally be called from a backend/Edge Function to protect API credentials
 */
export async function submitRefillToBestRX(
  payload: Record<string, unknown>
): Promise<{ success: boolean; message: string; data?: unknown }> {
  try {
    const response = await fetch(BESTRX_ENDPOINTS.refill, {
      method: 'POST' as const,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseData = (await response.json()) as unknown;

    if (!response.ok) {
      const errorMessage = extractRefillErrorMessage(responseData);
      return {
        success: false,
        message:
          errorMessage ||
          mapBestRXError(undefined, response.status),
      };
    }

    if (!validateRefillResponse(responseData)) {
      const errorMessage = extractRefillErrorMessage(responseData);
      return {
        success: false,
        message: errorMessage || 'Unable to process refill request. Please try again.',
      };
    }

    return {
      success: true,
      message: 'Refill request submitted successfully',
      data: responseData,
    };
  } catch (error) {
    console.error('BestRX Refill Error:', error);
    return {
      success: false,
      message: 'Unable to connect to pharmacy service. Please try again later.',
    };
  }
}

/**
 * Makes a BestRX Transfer Request
 * Note: This should ideally be called from a backend/Edge Function to protect API credentials
 */
export async function submitTransferToBestRX(
  payload: Record<string, unknown>,
  basicAuthHeader: string
): Promise<{ success: boolean; message: string; data?: unknown }> {
  try {
    const response = await fetch(BESTRX_ENDPOINTS.transfer, {
      method: 'POST' as const,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': basicAuthHeader,
      },
      body: JSON.stringify(payload),
    });

    const responseData = (await response.json()) as unknown;

    if (!response.ok) {
      const errorMessage = extractTransferErrorMessage(responseData);
      return {
        success: false,
        message:
          errorMessage ||
          mapBestRXError(undefined, response.status),
      };
    }

    if (!validateTransferResponse(responseData)) {
      const errorMessage = extractTransferErrorMessage(responseData);
      return {
        success: false,
        message:
          errorMessage ||
          'Unable to process transfer request. Please try again.',
      };
    }

    return {
      success: true,
      message: 'Transfer request submitted successfully',
      data: responseData,
    };
  } catch (error) {
    console.error('BestRX Transfer Error:', error);
    return {
      success: false,
      message: 'Unable to connect to pharmacy service. Please try again later.',
    };
  }
}
