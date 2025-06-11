# M-Pesa Integration Setup Guide

### 1. **Environment Configuration**
- ✅ Created `.env` file with your M-Pesa credentials
- ✅ Added sandbox configuration for testing
- ✅ Set up callback URLs for local development

### 2. **M-Pesa Service Implementation**
- ✅ Created `src/lib/services/mpesa.js` with full M-Pesa API integration
- ✅ Implemented OAuth authentication
- ✅ Added STK Push functionality
- ✅ Added payment status checking
- ✅ Phone number formatting and validation

### 3. **API Endpoints**
- ✅ `/api/payments/mpesa/stkpush` - Initiate STK Push payments
- ✅ `/api/payments/mpesa/callback` - Handle M-Pesa callbacks
- ✅ `/api/payments/status/[transactionId]` - Check payment status

### 4. **Database Updates**
- ✅ Added M-Pesa specific fields to donation model
- ✅ Updated schema to track M-Pesa transactions
- ✅ Added payment status tracking

### 5. **Frontend Integration**
- ✅ Updated donation form to handle M-Pesa flow
- ✅ Added payment status polling
- ✅ Improved user experience with real-time updates

## 🚀 How to Test Your M-Pesa Integration

### Step 1: Ensure Database is Seeded
If you haven't already, make sure you have sample projects:
```bash
npm run db:seed
```

### Step 2: Start Your Development Server
```bash
npm run dev
```

### Step 2: Set Up ngrok for Callbacks (Required for M-Pesa)
M-Pesa requires a publicly accessible callback URL. Install and run ngrok:

# In a new terminal, expose your local server
ngrok http --url=neat-precise-trout.ngrok-free.app 5173
```

### Step 3: Update Callback URL
Copy the ngrok URL (e.g., `https://https://neat-precise-trout.ngrok-free.app`) and update your `.env` file:

```env
MPESA_CALLBACK_URL=https://neat-precise-trout.ngrok-free.app/api/payments/mpesa/callback
MPESA_TIMEOUT_URL=https://neat-precise-trout.ngrok-free.app/api/payments/mpesa/timeout
```

### Step 4: Test the Integration
1. Open your application at `http://https://neat-precise-trout.ngrok-free.app`
2. Navigate to a project and click "Donate"
3. Fill in the donation form with:
   - **Amount**: Any amount (minimum KES 2)
   - **Phone Number**: Use a Safaricom number (for testing: `254708374149`)
   - **Payment Method**: Select M-Pesa
4. Submit the donation
5. Check your phone for the M-Pesa STK Push prompt
6. Enter your M-Pesa PIN to complete the payment

## 📱 Test Phone Numbers (Sandbox)

For testing in sandbox mode, you can use these Safaricom test numbers:
- `254708374149`
- `254711XXXXXX` (any valid Safaricom number format)

## 🔧 Configuration Details

### Your M-Pesa Credentials
```env
MPESA_CONSUMER_KEY=consumer_key
MPESA_CONSUMER_SECRET=consumer_secret
MPESA_SHORTCODE=174379 (Sandbox test shortcode)
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
```

### API Endpoints Created
1. **STK Push**: `POST /api/payments/mpesa/stkpush`
2. **Callback**: `POST /api/payments/mpesa/callback`
3. **Status Check**: `GET /api/payments/status/[transactionId]`

## 🔄 Payment Flow

1. **User initiates donation** → Creates donation record
2. **STK Push sent** → User receives M-Pesa prompt on phone
3. **User enters PIN** → M-Pesa processes payment
4. **Callback received** → Updates donation status
5. **Frontend polls status** → Shows real-time updates
6. **Payment completed** → Project amount updated

## 🐛 Troubleshooting

### Common Issues:

1. **"M-Pesa service not configured"**
   - Check your `.env` file has all required variables
   - Restart your development server

2. **"STK Push failed"**
   - Verify your Consumer Key and Secret are correct
   - Check if ngrok is running and callback URL is updated
   - Ensure phone number is in correct format (254XXXXXXXXX)

3. **"Callback not received"**
   - Verify ngrok is running and accessible
   - Check callback URL in `.env` matches ngrok URL
   - Look at ngrok logs for incoming requests

4. **"Payment status stuck on pending"**
   - Check M-Pesa sandbox status
   - Verify callback URL is publicly accessible
   - Check server logs for callback processing errors

### Debug Tips:
- Check browser console for frontend errors
- Check server logs for API errors
- Use ngrok web interface (`http://neat-precise-trout.ngrok-free.app`) to see callback requests
- Test with small amounts (KES 2-10) in sandbox

## 🚀 Going Live (Production)

When ready for production:

1. **Apply for Go-Live** on Safaricom Developer Portal
2. **Update environment variables**:
   ```env
   MPESA_ENVIRONMENT=production
   MPESA_SHORTCODE=your_production_shortcode
   MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa/callback
   ```
3. **Use production credentials** from your approved app
4. **Test thoroughly** with real transactions

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Safaricom M-Pesa API documentation
3. Check your Safaricom Developer Portal for app status
4. Ensure all credentials are correctly configured

## 🎯 Next Steps

1. **Test the integration** with the steps above
2. **Customize the UI** to match your brand
3. **Add error handling** for edge cases
4. **Implement receipt generation** for completed payments
5. **Add payment analytics** and reporting

Your M-Pesa integration is now ready for testing! 🚀
