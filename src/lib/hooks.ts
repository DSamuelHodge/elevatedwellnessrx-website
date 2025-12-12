import { useState } from "react";
import { supabase } from "./supabaseClient";
import {
  ContactFormData,
  WaitlistFormData,
  RefillFormData,
  TransferFormData,
  SplashModalFormData,
} from "./schemas";
import {
  buildRefillRequestPayload,
  buildTransferRequestPayload,
  buildBasicAuthHeader,
  submitRefillToBestRX,
  submitTransferToBestRX,
} from "./bestrx";

type SubmissionStatus = "idle" | "submitting" | "success" | "error";

export function useContactFormSubmission() {
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (data: ContactFormData) => {
    setStatus("submitting");
    setError(null);

    try {
      const { data: id, error: rpcError } = await supabase.rpc(
        "submit_contact_form",
        {
          p_name: data.name,
          p_phone: data.phone,
          p_email: data.email,
          p_reason: data.reason,
          p_message: data.message,
          p_consent: data.consent,
        }
      );

      if (rpcError) {
        throw new Error(rpcError.message);
      }

      setStatus("success");
      return id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Submission failed";
      setError(errorMessage);
      setStatus("error");
      throw err;
    }
  };

  return { submit, status, error };
}

export function useWaitlistFormSubmission() {
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (data: WaitlistFormData) => {
    setStatus("submitting");
    setError(null);

    try {
      const { data: id, error: rpcError } = await supabase.rpc(
        "submit_waitlist_entry",
        {
          p_name: data.name,
          p_email: data.email,
          p_phone: data.phone,
        }
      );

      if (rpcError) {
        throw new Error(rpcError.message);
      }

      setStatus("success");
      return id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Submission failed";
      setError(errorMessage);
      setStatus("error");
      throw err;
    }
  };

  return { submit, status, error };
}

export function useRefillFormSubmission() {
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (data: RefillFormData) => {
    setStatus("submitting");
    setError(null);

    try {
      // Get BestRX credentials from environment (defined in vite.config.ts)
      const username = process.env.BESTRX_USERNAME;
      const apiKey = process.env.BESTRX_API_KEY;
      const pharmacyNumber = process.env.BESTRX_PHARMACY_NUMBER;

      if (!username || !apiKey || !pharmacyNumber) {
        throw new Error(
          "Pharmacy service is not properly configured. Please contact support."
        );
      }

      // Step 1: Build BestRX payload
      const payload = buildRefillRequestPayload(
        data,
        pharmacyNumber,
        apiKey,
        username
      );

      // Step 2: Submit to BestRX API
      // IMPORTANT: In production, this should be called from a backend/Edge Function
      // to keep API credentials secure. This frontend call is for development only.
      const result = await submitRefillToBestRX(payload);

      if (!result.success) {
        throw new Error(result.message);
      }

      // Step 3: Persist to Supabase for audit trail
      // This is a secondary operation; failure here doesn't prevent the refill submission
      try {
        await supabase.rpc("submit_refill_request", {
          p_patient_name: data.patientName,
          p_dob: data.dob,
          p_phone: data.phone,
          p_email: data.email || "",
          p_prescription_numbers: data.prescriptionNumbers,
          p_medication_names: data.medicationNames,
          p_preferred_service: data.preferredService,
          p_notes: data.notes || "",
          p_consent: data.consent,
        });
      } catch (supabaseError) {
        console.warn("Failed to save refill request to database:", supabaseError);
        // Don't throw - BestRX submission succeeded, which is the primary goal
      }

      setStatus("success");
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Submission failed";
      setError(errorMessage);
      setStatus("error");
      throw err;
    }
  };

  return { submit, status, error };
}

export function useTransferFormSubmission() {
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (data: TransferFormData) => {
    setStatus("submitting");
    setError(null);

    try {
      // Get BestRX credentials from environment (defined in vite.config.ts)
      const username = process.env.BESTRX_USERNAME;
      const password = process.env.BESTRX_PASSWORD;
      const pharmacyNumber = process.env.BESTRX_PHARMACY_NUMBER;

      if (!username || !password || !pharmacyNumber) {
        throw new Error(
          "Pharmacy service is not properly configured. Please contact support."
        );
      }

      // Step 1: Build BestRX payload
      const payload = buildTransferRequestPayload(data, pharmacyNumber);

      // Step 2: Build Basic Auth header
      const authHeader = buildBasicAuthHeader(username, password);

      // Step 3: Submit to BestRX API
      // IMPORTANT: In production, this should be called from a backend/Edge Function
      // to keep API credentials secure. This frontend call is for development only.
      const result = await submitTransferToBestRX(payload, authHeader);

      if (!result.success) {
        throw new Error(result.message);
      }

      // Step 4: Persist to Supabase for audit trail
      // This is a secondary operation; failure here doesn't prevent the transfer submission
      try {
        await supabase.rpc("submit_transfer_request", {
          p_rx_number: data.rxNumber,
          p_rx_fill_date: data.rxFillDate,
          p_transfer_to_pharmacy_name: data.transferToPharmacyName,
          p_transfer_to_pharmacy_address1: data.transferToPharmacyAddress1,
          p_transfer_to_pharmacy_address2: data.transferToPharmacyAddress2 || "",
          p_transfer_to_pharmacy_city: data.transferToPharmacyCity,
          p_transfer_to_pharmacy_state: data.transferToPharmacyState,
          p_transfer_to_pharmacy_zip: data.transferToPharmacyZip,
          p_transfer_to_pharmacy_phone: data.transferToPharmacyPhone,
          p_transfer_to_pharmacy_ncpdp: data.transferToPharmacyNCPDP || "",
          p_transfer_rx_remark: data.transferRxRemark || "",
          p_consent: data.consent,
        });
      } catch (supabaseError) {
        console.warn("Failed to save transfer request to database:", supabaseError);
        // Don't throw - BestRX submission succeeded, which is the primary goal
      }

      setStatus("success");
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Submission failed";
      setError(errorMessage);
      setStatus("error");
      throw err;
    }
  };

  return { submit, status, error };
}

export function useSplashModalFormSubmission() {
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (data: SplashModalFormData) => {
    setStatus("submitting");
    setError(null);

    try {
      const { data: id, error: rpcError } = await supabase.rpc(
        "submit_splash_modal_signup",
        {
          p_email: data.email,
        }
      );

      if (rpcError) {
        throw new Error(rpcError.message);
      }

      setStatus("success");
      return id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Submission failed";
      setError(errorMessage);
      setStatus("error");
      throw err;
    }
  };

  return { submit, status, error };
}
