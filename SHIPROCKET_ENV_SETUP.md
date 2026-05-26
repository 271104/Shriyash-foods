# ============================================================
# SHIPROCKET INTEGRATION - ENVIRONMENT VARIABLES
# ============================================================
#
# Add these environment variables to your .env file
# in the root directory of the project
#

# Shiprocket API Credentials
# Get these from your Shiprocket account dashboard
SHIPROCKET_EMAIL=your_shiprocket_email@example.com
SHIPROCKET_PASSWORD=your_shiprocket_password

# Shiprocket API Base URL
# Default is production URL, no need to change unless using sandbox
SHIPROCKET_BASE_URL=https://apiv2.shiprocket.in/v1/external

# Shiprocket Webhook Secret
# Used to verify webhook authenticity (optional, for production)
SHIPROCKET_WEBHOOK_SECRET=your_webhook_secret_if_needed

# ============================================================
# EXAMPLE COMPLETE .env FILE
# ============================================================
# 
# NODE_ENV=development
# MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname
# JWT_SECRET=your_jwt_secret_key
# CLIENT_URL=http://localhost:3000
# 
# RAZORPAY_KEY_ID=your_razorpay_key
# RAZORPAY_KEY_SECRET=your_razorpay_secret
# 
# SHIPROCKET_EMAIL=your_email@shiprocket.com
# SHIPROCKET_PASSWORD=your_shiprocket_password
# SHIPROCKET_BASE_URL=https://apiv2.shiprocket.in/v1/external
# SHIPROCKET_WEBHOOK_SECRET=your_webhook_secret
# 
# TWILIO_ACCOUNT_SID=your_twilio_sid
# TWILIO_AUTH_TOKEN=your_twilio_token
# TWILIO_PHONE_NUMBER=+1234567890
# 
# CLOUDINARY_CLOUD_NAME=your_cloud_name
# CLOUDINARY_API_KEY=your_api_key
# CLOUDINARY_API_SECRET=your_api_secret
#

# ============================================================
# HOW TO GET SHIPROCKET CREDENTIALS
# ============================================================
#
# 1. Create an account at https://www.shiprocket.in/
# 2. Login to dashboard: https://dashboard.shiprocket.in/
# 3. Go to Settings → API Keys (or Integration → API)
# 4. Your email is the one registered with Shiprocket
# 5. Generate or use your account password
# 6. Copy Email and Password to .env
#
# ============================================================
