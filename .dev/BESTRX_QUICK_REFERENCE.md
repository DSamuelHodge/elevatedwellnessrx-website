# BestRX Integration - Quick Reference Guide

## For Developers

### What Was Done
✅ Restored BestRX API integration (Refill & Transfer requests)  
✅ Created comprehensive BestRX utility library  
✅ Updated form submission hooks with BestRX logic  
✅ Added environment configuration template  
✅ Created complete Edge Function implementation guide  

### Quick Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Create `.env` File**
   ```bash
   cp .env.example .env
   # Edit .env with your BestRX credentials
   ```

3. **Required Credentials**
   ```env
   BESTRX_USERNAME=your-username
   BESTRX_API_KEY=your-api-key
   BESTRX_PASSWORD=your-password
   BESTRX_PHARMACY_NUMBER=your-pharmacy-number
   ```

### File Structure

```
lib/
├── bestrx.ts              # BestRX API utilities (NEW)
├── hooks.ts               # Updated refill/transfer hooks
├── schemas.ts             # Zod validation schemas
└── supabaseClient.ts      # Supabase initialization

.env.example               # Updated with BestRX credentials
BESTRX_IMPLEMENTATION.md   # Detailed implementation summary
EDGE_FUNCTION_SETUP.md     # Production deployment guide (NEW)
```

### How It Works

#### Current (Development)
```
React Form
    ↓ (Zod Validation)
Refill/Transfer Hook
    ↓ (BestRX Utility)
BestRX API
    ↓ (Success/Error)
Supabase Log (optional)
    ↓
User Message
```

#### Production (Recommended)
```
React Form
    ↓ (Zod Validation)
Refill/Transfer Hook
    ↓ (JWT Auth)
Supabase Edge Function
    ↓ (Server-side)
BestRX API (credentials protected)
    ↓
Database Log
    ↓
Return Response
```

### Key Functions

#### BestRX Utilities (`lib/bestrx.ts`)

**Payload Builders**
```typescript
// Refill Request
buildRefillRequestPayload(formData, pharmacyNumber, apiKey, username)

// Transfer Request  
buildTransferRequestPayload(formData, pharmacyNumber)

// Auth Header
buildBasicAuthHeader(username, password) // For transfers
```

**API Calls**
```typescript
// Direct calls (for development)
submitRefillToBestRX(payload)
submitTransferToBestRX(payload, authHeader)

// Returns: { success: boolean; message: string; data?: unknown }
```

**Helpers**
```typescript
formatPhoneForBestRX(phone)        // Remove non-numeric chars
mapBestRXError(code, httpStatus)  // User-friendly error messages
validateRefillResponse(response)   // Check response validity
validateTransferResponse(response) // Check response validity
```

#### Form Hooks (`lib/hooks.ts`)

**Refill Submission**
```typescript
const { submit, status, error } = useRefillFormSubmission();

try {
  await submit({
    patientName: "John Doe",
    dob: "1990-01-15",      // YYYY-MM-DD format
    phone: "(555) 123-4567",
    email: "john@example.com",
    prescriptionNumbers: "123456, 789012",  // Comma-separated
    medicationNames: "Lisinopril, Metformin",  // Comma-separated
    preferredService: "Pickup",
    notes: "Rush processing if possible",
    consent: true
  });
  
  if (status === 'success') {
    console.log('Refill submitted to BestRX');
  }
} catch (error) {
  console.error(error.message); // User-friendly error
}
```

**Transfer Submission**
```typescript
const { submit, status, error } = useTransferFormSubmission();

try {
  await submit({
    rxNumber: "123456",
    rxFillDate: "2024-12-01",  // YYYY-MM-DD format
    transferToPharmacyName: "CVS Pharmacy",
    transferToPharmacyAddress1: "123 Main St",
    transferToPharmacyAddress2: "Suite 100",
    transferToPharmacyCity: "Columbus",
    transferToPharmacyState: "OH",
    transferToPharmacyZip: "43215",
    transferToPharmacyPhone: "(614) 555-1234",
    transferToPharmacyNCPDP: "1234567",
    transferRxRemark: "Moving to this area",
    consent: true
  });
  
  if (status === 'success') {
    console.log('Transfer submitted to BestRX');
  }
} catch (error) {
  console.error(error.message); // User-friendly error
}
```

### Testing Checklist

**Development Testing**
- [ ] Form validation works (Zod)
- [ ] BestRX credentials loaded correctly
- [ ] Refill submission succeeds with valid data
- [ ] Transfer submission succeeds with valid data
- [ ] Error messages display correctly for invalid data
- [ ] Phone numbers formatted correctly (digits only)
- [ ] Dates parsed correctly (YYYY-MM-DD)
- [ ] Supabase fallback logging works

**Network Debugging**
```javascript
// Check environment variables in browser console
console.log(process.env.BESTRX_USERNAME);
console.log(process.env.BESTRX_API_KEY);

// Monitor network requests
// DevTools → Network tab → filter by "bestrx"
```

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Pharmacy service is not properly configured" | Missing env variables | Check `.env` file, restart dev server |
| "Unable to connect to pharmacy service" | BestRX API down | Check BestRX status page, retry |
| CORS error | Frontend making direct calls | Must use Edge Function in production |
| "Patient information not found" | Wrong DOB format | Use YYYY-MM-DD format |
| "Prescription not found" | Invalid Rx number | Verify prescription number with BestRX |
| "Invalid pharmacy number" | Wrong pharmacy ID | Check BESTRX_PHARMACY_NUMBER env var |

### Transitioning to Production

1. **Create Edge Functions**
   - Follow `EDGE_FUNCTION_SETUP.md`
   - Deploy to Supabase
   - Set secrets in Supabase dashboard

2. **Update Frontend Hooks**
   - Replace direct BestRX calls with Edge Function calls
   - Pass JWT authentication token
   - See example in `EDGE_FUNCTION_SETUP.md`

3. **Environment Configuration**
   - Remove BestRX credentials from frontend `.env`
   - Set secrets in Supabase console
   - Update `vite.config.ts` to remove BestRX env variables

4. **Testing**
   - Test Edge Functions locally
   - Test with real BestRX credentials
   - Monitor Edge Function logs

### API Details

**BestRX Refill Endpoint**
```
POST https://webservice.bcsbestrx.com/bcswebservice/v2/webrefillservice/SendRefillRequest
Content-Type: application/json

{
  "userName": "your-username",
  "APIKey": "your-api-key",
  "PharmacyNumber": "12345",
  "LastName": "Doe",
  "DOB": "1990-01-15",
  "Phone": "5551234567",
  "DeliveryOption": "Pickup",
  "RxInRefillRequest": [
    { "RxNumber": "123456", "MedicationName": "Lisinopril" }
  ]
}
```

**BestRX Transfer Endpoint**
```
POST https://dataservice.bestrxconnect.com/prescription/submitrxtransferrequest
Content-Type: application/json
Authorization: Basic base64(username:password)

{
  "PharmacyNumber": "12345",
  "RxNo": "123456",
  "RxFillDate": "2024-12-01",
  "TransferToPharmacy": {
    "Name": "CVS Pharmacy",
    "Address": "123 Main St",
    "City": "Columbus",
    "State": "OH",
    "Zip": "43215",
    "Phone": "6145551234"
  },
  "TransferDate": "2024-12-10",
  "Comments": "Moving to area"
}
```

### Error Codes

**Refill Errors**
- `ERROR_INVALID_PHARMACY` - Check pharmacy number
- `ERROR_INVALID_PATIENT` - Check name and DOB
- `ERROR_RX_NOT_FOUND` - Verify prescription number
- `ERROR_RX_INACTIVE` - Prescription expired
- `ERROR_RX_REFILLED` - Already refilled recently

**Transfer Errors**
- `ERROR0027` - Prescription not found
- `ERROR0069` - Cannot transfer this prescription
- `ERROR0070` - Invalid destination pharmacy
- `ERROR0080` - Patient not found
- `ERROR0003` - DOB mismatch
- `ERROR0082` - Transfer limit exceeded

### Performance Tips

1. **Debounce Submissions** - Add debouncing to prevent double-submits
2. **Cache Credentials** - Load env vars once, reuse in hooks
3. **Error Recovery** - Allow retry on network failures
4. **Timeout Handling** - Set 30-second timeout for BestRX API calls
5. **Batch Operations** - Combine multiple Rx numbers in one request

### Monitoring

**Development**
- Check browser DevTools console for errors
- Monitor Network tab for BestRX API calls
- Review React component state (React DevTools)

**Production**
- Monitor Supabase Edge Function logs
- Set up alerts for failed submissions
- Track API response times
- Log errors to error tracking service (e.g., Sentry)

### Documentation References

- `BESTRX_IMPLEMENTATION.md` - Detailed implementation summary
- `EDGE_FUNCTION_SETUP.md` - Production deployment guide
- `lib/bestrx.ts` - BestRX utility source code (well-commented)
- `lib/hooks.ts` - Form submission hooks
- `.env.example` - Configuration template

---

**Last Updated**: December 10, 2025  
**Status**: ✅ Ready for Development & Production
