# Twilio WhatsApp OTP Setup Guide

## Step 1: Create Twilio Account

1. Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up for a free account
3. Verify your email and phone number

## Step 2: Get Your Credentials

1. After logging in, go to your [Twilio Console](https://console.twilio.com/)
2. Find your **Account SID** and **Auth Token** on the dashboard
3. Copy these values

## Step 3: Set Up WhatsApp Sandbox (For Testing)

1. In Twilio Console, go to **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Follow the instructions to join the WhatsApp Sandbox:
   - Send a WhatsApp message to the number shown (usually +1 415 523 8886)
   - Send the code shown (e.g., "join <your-code>")
3. The sandbox number is: `whatsapp:+14155238886`

## Step 4: Update Your .env File

Open `Ragnor/.env` and update these values:

```env
TWILIO_ACCOUNT_SID=your_actual_account_sid_here
TWILIO_AUTH_TOKEN=your_actual_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

## Step 5: Test the Setup

1. Restart your server
2. Try to register with your phone number
3. You should receive an OTP on WhatsApp

## For Production (After Testing)

### Option 1: Twilio WhatsApp Business API (Recommended)
1. Apply for WhatsApp Business API access through Twilio
2. Get your own WhatsApp Business number
3. Update the `TWILIO_WHATSAPP_NUMBER` in .env

### Option 2: Use SMS Instead
If WhatsApp approval takes time, you can modify the code to send SMS:
- Change `whatsappNumber` format in `otpService.js`
- Remove `whatsapp:` prefix from phone numbers

## Pricing

- **Free Trial**: $15 credit (enough for testing)
- **WhatsApp Messages**: ~$0.005 per message
- **SMS**: ~$0.0075 per message

## Important Notes

1. **Sandbox Limitations**:
   - Only works with numbers that have joined the sandbox
   - For production, you need WhatsApp Business API approval

2. **Phone Number Format**:
   - Must include country code
   - India: +91XXXXXXXXXX
   - US: +1XXXXXXXXXX

3. **Security**:
   - Never commit your .env file to Git
   - Keep your Auth Token secret
   - Use environment variables in production

## Troubleshooting

### OTP not received?
- Check if you've joined the WhatsApp Sandbox
- Verify phone number format includes country code
- Check Twilio Console logs for errors

### "Authentication failed" error?
- Verify Account SID and Auth Token are correct
- Check if Twilio account is active

### Need Help?
- Twilio Documentation: https://www.twilio.com/docs/whatsapp
- Support: https://support.twilio.com/

## Alternative Services

If Twilio doesn't work for you, consider:
1. **MSG91** - Popular in India
2. **Gupshup** - WhatsApp Business API
3. **Kaleyra** - SMS and WhatsApp
