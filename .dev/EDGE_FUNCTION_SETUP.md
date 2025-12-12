# Supabase Edge Function Implementation Guide

## Overview

This guide explains how to implement a secure Supabase Edge Function that acts as a backend proxy for BestRX API calls. This architecture ensures API credentials remain secure and are never exposed to the frontend.

## Architecture

```
Frontend (React)
    ↓
    └→ Zod Validation
    └→ Supabase RPC Call
    ↓
Supabase Edge Function
    ↓
    └→ Receives validated form data
    └→ Loads BestRX credentials from secrets
    └→ Constructs BestRX payload
    └→ Calls BestRX API
    └→ Returns response to frontend
    ↓
Audit Logging (Supabase DB)
```

## Setup Steps

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Initialize Edge Functions (if not already done)

```bash
supabase functions new send-refill-request
supabase functions new submit-transfer-request
```

This creates `supabase/functions/send-refill-request/` and `supabase/functions/submit-transfer-request/` directories.

### 3. Configure Secrets

Store BestRX credentials as Supabase secrets:

```bash
supabase secrets set BESTRX_USERNAME "your-username"
supabase secrets set BESTRX_API_KEY "your-api-key"
supabase secrets set BESTRX_PASSWORD "your-password"
supabase secrets set BESTRX_PHARMACY_NUMBER "your-pharmacy-number"
```

For local development, add these to `.env.local`:

```env
BESTRX_USERNAME=your-username
BESTRX_API_KEY=your-api-key
BESTRX_PASSWORD=your-password
BESTRX_PHARMACY_NUMBER=your-pharmacy-number
```

## Edge Function Implementation

### Refill Request Function

**File:** `supabase/functions/send-refill-request/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RefillRequest {
  patientName: string;
  dob: string;
  phone: string;
  email?: string;
  prescriptionNumbers: string;
  medicationNames: string;
  preferredService: string;
  notes?: string;
  consent: boolean;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get request body
    const body: RefillRequest = await req.json();

    // Validate required fields
    if (!body.patientName || !body.dob || !body.phone || !body.prescriptionNumbers) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get BestRX credentials from secrets
    const bestrxUsername = Deno.env.get("BESTRX_USERNAME");
    const bestrxApiKey = Deno.env.get("BESTRX_API_KEY");
    const bestrxPharmacyNumber = Deno.env.get("BESTRX_PHARMACY_NUMBER");

    if (!bestrxUsername || !bestrxApiKey || !bestrxPharmacyNumber) {
      console.error("Missing BestRX configuration");
      return new Response(
        JSON.stringify({ error: "Service not properly configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse prescription numbers and medications
    const rxNumbers = body.prescriptionNumbers
      .split(",")
      .map((num) => num.trim())
      .filter((num) => num.length > 0);

    const medications = body.medicationNames
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    // Build BestRX payload
    const rxInRefillRequest = rxNumbers.map((rxNumber, index) => ({
      RxNumber: rxNumber,
      MedicationName: medications[index] || "",
    }));

    const bestrxPayload = {
      userName: bestrxUsername,
      APIKey: bestrxApiKey,
      PharmacyNumber: bestrxPharmacyNumber,
      LastName: body.patientName.split(" ").pop() || body.patientName,
      DOB: body.dob,
      Phone: body.phone.replace(/\D/g, ""),
      DeliveryOption: body.preferredService || "Pickup",
      RxInRefillRequest: rxInRefillRequest,
    };

    // Call BestRX API
    const bestrxResponse = await fetch(
      "https://webservice.bcsbestrx.com/bcswebservice/v2/webrefillservice/SendRefillRequest",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bestrxPayload),
      }
    );

    const bestrxData = await bestrxResponse.json();

    if (!bestrxResponse.ok) {
      console.error("BestRX API error:", bestrxData);
      return new Response(
        JSON.stringify({
          error: "Failed to process refill request",
          details: bestrxData,
        }),
        {
          status: bestrxResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate response
    const rxResponses = bestrxData.RxInRefillResponse || [];
    const hasSuccess = rxResponses.some((rx: any) => rx.Status === "OK");

    if (!hasSuccess) {
      const firstError = rxResponses.find((rx: any) => rx.Status !== "OK");
      return new Response(
        JSON.stringify({
          error: firstError?.ErrorMessage || "Unable to process refill",
          errorCode: firstError?.ErrorCode,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log to database (optional - requires authenticated Supabase client)
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      await supabase.from("refill_requests").insert({
        patient_name: body.patientName,
        dob: body.dob,
        phone: body.phone,
        email: body.email || null,
        prescription_numbers: body.prescriptionNumbers,
        medication_names: body.medicationNames,
        preferred_service: body.preferredService,
        notes: body.notes || null,
        consent: body.consent,
        bestrx_response: bestrxData,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Refill request processed successfully",
        data: bestrxData,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

### Transfer Request Function

**File:** `supabase/functions/submit-transfer-request/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TransferRequest {
  rxNumber: string;
  rxFillDate: string;
  transferToPharmacyName: string;
  transferToPharmacyAddress1: string;
  transferToPharmacyAddress2?: string;
  transferToPharmacyCity: string;
  transferToPharmacyState: string;
  transferToPharmacyZip: string;
  transferToPharmacyPhone: string;
  transferToPharmacyNCPDP?: string;
  transferRxRemark?: string;
  consent: boolean;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get request body
    const body: TransferRequest = await req.json();

    // Validate required fields
    if (
      !body.rxNumber ||
      !body.rxFillDate ||
      !body.transferToPharmacyName ||
      !body.transferToPharmacyCity ||
      !body.transferToPharmacyState ||
      !body.transferToPharmacyZip
    ) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get BestRX credentials from secrets
    const bestrxUsername = Deno.env.get("BESTRX_USERNAME");
    const bestrxPassword = Deno.env.get("BESTRX_PASSWORD");
    const bestrxPharmacyNumber = Deno.env.get("BESTRX_PHARMACY_NUMBER");

    if (!bestrxUsername || !bestrxPassword || !bestrxPharmacyNumber) {
      console.error("Missing BestRX configuration");
      return new Response(
        JSON.stringify({ error: "Service not properly configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build Basic Auth header
    const credentials = `${bestrxUsername}:${bestrxPassword}`;
    const basicAuth = `Basic ${btoa(credentials)}`;

    // Get current date for transfer
    const transferDate = new Date().toISOString().split("T")[0];

    // Build BestRX payload
    const bestrxPayload = {
      PharmacyNumber: bestrxPharmacyNumber,
      RxNo: body.rxNumber,
      RxFillDate: body.rxFillDate,
      TransferToPharmacy: {
        Name: body.transferToPharmacyName,
        Address: body.transferToPharmacyAddress1,
        Address2: body.transferToPharmacyAddress2 || "",
        City: body.transferToPharmacyCity,
        State: body.transferToPharmacyState,
        Zip: body.transferToPharmacyZip,
        Phone: body.transferToPharmacyPhone.replace(/\D/g, ""),
        NCPDP: body.transferToPharmacyNCPDP || "",
      },
      TransferDate: transferDate,
      Comments: body.transferRxRemark || "",
    };

    // Call BestRX API
    const bestrxResponse = await fetch(
      "https://dataservice.bestrxconnect.com/prescription/submitrxtransferrequest",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": basicAuth,
        },
        body: JSON.stringify(bestrxPayload),
      }
    );

    const bestrxData = await bestrxResponse.json();

    if (!bestrxResponse.ok) {
      console.error("BestRX API error:", bestrxData);
      return new Response(
        JSON.stringify({
          error: "Failed to process transfer request",
          details: bestrxData,
        }),
        {
          status: bestrxResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate response
    if (!bestrxData.IsValid || !bestrxData.RxTransferred) {
      return new Response(
        JSON.stringify({
          error: bestrxData.ErrorMessage || "Unable to transfer prescription",
          errorCode: bestrxData.ErrorCode,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log to database (optional - requires authenticated Supabase client)
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      await supabase.from("transfer_requests").insert({
        rx_number: body.rxNumber,
        rx_fill_date: body.rxFillDate,
        transfer_to_pharmacy_name: body.transferToPharmacyName,
        transfer_to_pharmacy_address1: body.transferToPharmacyAddress1,
        transfer_to_pharmacy_address2: body.transferToPharmacyAddress2 || null,
        transfer_to_pharmacy_city: body.transferToPharmacyCity,
        transfer_to_pharmacy_state: body.transferToPharmacyState,
        transfer_to_pharmacy_zip: body.transferToPharmacyZip,
        transfer_to_pharmacy_phone: body.transferToPharmacyPhone,
        transfer_to_pharmacy_ncpdp: body.transferToPharmacyNCPDP || null,
        transfer_rx_remark: body.transferRxRemark || null,
        consent: body.consent,
        bestrx_response: bestrxData,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Transfer request processed successfully",
        data: bestrxData,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

## Deploying Edge Functions

### Local Testing

```bash
supabase start
supabase functions serve
```

Then test by calling from your frontend:

```typescript
const response = await fetch(
  'http://localhost:54321/functions/v1/send-refill-request',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabase.auth.session()?.access_token}`,
    },
    body: JSON.stringify(refillFormData),
  }
);
```

### Production Deployment

```bash
supabase functions deploy send-refill-request
supabase functions deploy submit-transfer-request
```

Set secrets in production:

```bash
supabase secrets set --project-id=YOUR_PROJECT_ID BESTRX_USERNAME "your-username"
supabase secrets set --project-id=YOUR_PROJECT_ID BESTRX_API_KEY "your-api-key"
supabase secrets set --project-id=YOUR_PROJECT_ID BESTRX_PASSWORD "your-password"
supabase secrets set --project-id=YOUR_PROJECT_ID BESTRX_PHARMACY_NUMBER "your-pharmacy-number"
```

## Frontend Integration Updates

Once Edge Functions are deployed, update the hooks to call the Edge Functions instead of the frontend BestRX API:

### Updated useRefillFormSubmission Hook

```typescript
export function useRefillFormSubmission() {
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (data: RefillFormData) => {
    setStatus("submitting");
    setError(null);

    try {
      // Get auth token from Supabase
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) {
        throw new Error("Authentication required");
      }

      // Call Edge Function instead of BestRX API directly
      const response = await fetch(
        `${process.env.VITE_SUPABASE_URL}/functions/v1/send-refill-request`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Refill request failed');
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
```

## Security Considerations

1. **API Keys Protection**: BestRX credentials are stored as Supabase secrets and never exposed to frontend
2. **Authentication**: Edge Functions verify user authentication via JWT token
3. **CORS**: Edge Functions handle CORS headers securely
4. **Audit Trail**: All submissions logged to database with BestRX responses
5. **Input Validation**: Both frontend (Zod) and backend (Edge Function) validate data
6. **Error Handling**: Sensitive error details kept server-side; user-friendly errors returned to frontend

## Monitoring & Debugging

View Edge Function logs:

```bash
supabase functions logs send-refill-request
supabase functions logs submit-transfer-request
```

Check function execution in Supabase Dashboard:
- Go to "Edge Functions" section
- Click on function name
- Review "Logs" tab for execution history and errors

## Troubleshooting

### Issue: "Missing authorization header"

**Solution**: Ensure frontend passes valid JWT token in Authorization header

### Issue: "Missing BestRX configuration"

**Solution**: Verify secrets are set in Supabase:
```bash
supabase secrets list
```

### Issue: "CORS error"

**Solution**: Ensure Edge Function returns correct CORS headers for your domain

### Issue: "BestRX API timeout"

**Solution**: Increase timeout in fetch request:
```typescript
const bestrxResponse = await fetch(..., {
  // ... other options
  signal: AbortSignal.timeout(30000), // 30 second timeout
});
```

## Additional Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [BestRX API Documentation](https://www.bestrxconnect.com/api-docs)
- [Deno Documentation](https://deno.land/)
