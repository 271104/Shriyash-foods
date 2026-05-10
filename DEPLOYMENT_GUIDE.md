# 🚀 Deployment Guide - Shriyash Foods Ecommerce

## ✅ Pre-Deployment Checklist

### 1. Backend Configuration ✅
- [x] Environment variables properly configured
- [x] CORS setup with production URL
- [x] Production error handling
- [x] Static file serving for React build
- [x] MongoDB connection with error handling

### 2. Frontend Configuration ⏳
- [ ] Build production bundle (`npm run build`)
- [ ] API endpoints configured
- [ ] Environment variables set

### 3. Database Setup ⏳
- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] IP whitelist configured (0.0.0.0/0 for cloud hosting)
- [ ] Connection string obtained

### 4. Third-Party Services ⏳
- [ ] Razorpay KYC completed (for live payments)
- [ ] Shiprocket account verified
- [ ] SMS service configured (MSG91/Twilio)
- [ ] Email service configured (Gmail App Password)

---

## 📦 Deployment Options

### Option 1: Render (Recommended - Free Tier Available)

**Pros:**
- ✅ Free tier available
- ✅ Easy deployment from GitHub
- ✅ Automatic HTTPS
- ✅ Good for MERN stack
- ✅ Environment variables support

**Steps:**

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/shriyash-foods.git
   git push -u origin main
   ```

2. **Create Render Account**
   - Go to https://render.com/
   - Sign up with GitHub

3. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: shriyash-foods
     - **Environment**: Node
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Plan**: Free

4. **Add Environment Variables**
   - Go to "Environment" tab
   - Add all variables from `.env.production.example`
   - Set `NODE_ENV=production`
   - Set `CLIENT_URL=https://your-app-name.onrender.com`

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Your app will be live at: `https://your-app-name.onrender.com`

---

### Option 2: Heroku (Paid - $5/month minimum)

**Pros:**
- ✅ Reliable and stable
- ✅ Easy deployment
- ✅ Good documentation
- ❌ No free tier anymore

**Steps:**

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   heroku create shriyash-foods
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGO_URI="your_mongodb_atlas_uri"
   heroku config:set JWT_SECRET="your_jwt_secret"
   heroku config:set RAZORPAY_KEY_ID="your_key"
   heroku config:set RAZORPAY_KEY_SECRET="your_secret"
   # ... add all other variables
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

6. **Open App**
   ```bash
   heroku open
   ```

---

### Option 3: Railway (Easy & Modern)

**Pros:**
- ✅ $5 free credit monthly
- ✅ Very easy deployment
- ✅ Modern UI
- ✅ GitHub integration

**Steps:**

1. **Create Railway Account**
   - Go to https://railway.app/
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure**
   - Railway auto-detects Node.js
   - Add environment variables in Settings
   - Set start command: `npm start`

4. **Deploy**
   - Automatic deployment on push
   - Get your URL from Settings

---

### Option 4: DigitalOcean App Platform

**Pros:**
- ✅ $5/month
- ✅ Good performance
- ✅ Scalable

**Steps:**

1. **Create DigitalOcean Account**
   - Go to https://www.digitalocean.com/

2. **Create App**
   - Go to "Apps" → "Create App"
   - Connect GitHub repository

3. **Configure**
   - Detect Node.js
   - Set build command: `npm run build`
   - Set run command: `npm start`
   - Add environment variables

4. **Deploy**
   - Click "Create Resources"
   - Wait for deployment

---

### Option 5: VPS (Advanced - Full Control)

**Providers:**
- DigitalOcean Droplet ($6/month)
- AWS EC2
- Google Cloud Compute Engine
- Linode

**Steps:**

1. **Create VPS Instance**
   - Ubuntu 22.04 LTS recommended
   - Minimum 1GB RAM

2. **SSH into Server**
   ```bash
   ssh root@your_server_ip
   ```

3. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Install MongoDB (or use Atlas)**
   ```bash
   # Use MongoDB Atlas instead (recommended)
   ```

5. **Clone Repository**
   ```bash
   git clone https://github.com/yourusername/shriyash-foods.git
   cd shriyash-foods
   ```

6. **Install Dependencies**
   ```bash
   npm install
   npm run build
   ```

7. **Create .env File**
   ```bash
   nano .env
   # Paste production environment variables
   ```

8. **Install PM2 (Process Manager)**
   ```bash
   npm install -g pm2
   pm2 start server/server.js --name shriyash-foods
   pm2 startup
   pm2 save
   ```

9. **Setup Nginx (Reverse Proxy)**
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/shriyash-foods
   ```

   ```nginx
   server {
       listen 80;
       server_name your_domain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   sudo ln -s /etc/nginx/sites-available/shriyash-foods /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

10. **Setup SSL (HTTPS)**
    ```bash
    sudo apt install certbot python3-certbot-nginx
    sudo certbot --nginx -d your_domain.com
    ```

---

## 🗄️ MongoDB Atlas Setup

1. **Create Account**
   - Go to https://cloud.mongodb.com/
   - Sign up for free

2. **Create Cluster**
   - Choose "Shared" (Free tier)
   - Select region closest to your hosting
   - Click "Create Cluster"

3. **Create Database User**
   - Go to "Database Access"
   - Add new user with password
   - Save credentials

4. **Whitelist IP**
   - Go to "Network Access"
   - Add IP: `0.0.0.0/0` (allow from anywhere)
   - Or add your hosting provider's IP

5. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your password
   - Replace `<dbname>` with `shriyash-foods`

---

## 💳 Razorpay Production Setup

1. **Complete KYC**
   - Go to https://dashboard.razorpay.com/
   - Complete business verification
   - Submit documents (PAN, GST, Bank details)
   - Wait for approval (1-2 business days)

2. **Get Live Keys**
   - After KYC approval
   - Go to Settings → API Keys
   - Generate Live Keys
   - Copy `Key ID` and `Key Secret`

3. **Update Environment**
   - Replace test keys with live keys
   - `RAZORPAY_KEY_ID=rzp_live_...`
   - `RAZORPAY_KEY_SECRET=...`

4. **Test Live Payments**
   - Use real card (small amount)
   - Verify payment success
   - Check Razorpay dashboard

---

## 📧 Email Setup (Gmail)

1. **Enable 2-Factor Authentication**
   - Go to Google Account settings
   - Security → 2-Step Verification
   - Enable it

2. **Create App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other"
   - Name it "Shriyash Foods"
   - Copy the 16-character password

3. **Update Environment**
   ```
   EMAIL_USER=your_business_email@gmail.com
   EMAIL_PASS=your_16_char_app_password
   ```

---

## 📱 SMS Setup (MSG91 - Recommended for India)

1. **Create Account**
   - Go to https://msg91.com/
   - Sign up

2. **Verify Business**
   - Complete KYC
   - Add sender ID (e.g., SHRFOD)

3. **Get API Key**
   - Go to API section
   - Copy Auth Key

4. **Update Code**
   - Integrate MSG91 in `server/services/otpService.js`
   - Replace console.log with actual SMS sending

---

## 🚢 Shiprocket Setup

1. **Create Account**
   - Go to https://www.shiprocket.in/
   - Sign up for business account

2. **Complete KYC**
   - Submit business documents
   - Wait for verification

3. **Get API Credentials**
   - Go to Settings → API
   - Copy email and generate password

4. **Update Environment**
   ```
   SHIPROCKET_EMAIL=your_email
   SHIPROCKET_PASSWORD=your_password
   ```

---

## 🧪 Testing Production Build Locally

Before deploying, test production build locally:

```bash
# Build frontend
npm run build

# Set production environment
export NODE_ENV=production  # Linux/Mac
set NODE_ENV=production     # Windows CMD
$env:NODE_ENV="production"  # Windows PowerShell

# Start server
npm start

# Test at http://localhost:5000
```

---

## 📊 Post-Deployment Checklist

- [ ] Website loads correctly
- [ ] All images display
- [ ] Products page works
- [ ] Cart functionality works
- [ ] User registration works
- [ ] User login works
- [ ] Guest checkout works
- [ ] Razorpay payment works (test with small amount)
- [ ] COD order works
- [ ] OTP verification works
- [ ] Order confirmation email sent
- [ ] Order tracking works
- [ ] Mobile responsive
- [ ] HTTPS enabled
- [ ] Custom domain configured (optional)

---

## 🔒 Security Checklist

- [ ] `.env` file not committed to Git
- [ ] Strong JWT_SECRET (64+ characters)
- [ ] MongoDB Atlas IP whitelist configured
- [ ] CORS configured with production URL
- [ ] HTTPS enabled
- [ ] Rate limiting added (optional)
- [ ] Input validation working
- [ ] Error messages don't expose sensitive info
- [ ] Razorpay webhook signature verification (optional)

---

## 📈 Monitoring & Maintenance

### Recommended Tools:
- **Uptime Monitoring**: UptimeRobot (free)
- **Error Tracking**: Sentry (free tier)
- **Analytics**: Google Analytics
- **Performance**: Google PageSpeed Insights

### Regular Tasks:
- Monitor server logs
- Check payment success rate
- Review failed orders
- Update dependencies monthly
- Backup database weekly
- Monitor disk space
- Check SSL certificate expiry

---

## 🆘 Troubleshooting

### Issue: "Cannot connect to MongoDB"
**Solution:**
- Check MongoDB Atlas IP whitelist
- Verify connection string
- Check network access settings

### Issue: "Razorpay payment fails"
**Solution:**
- Verify live keys are correct
- Check KYC status
- Test with test keys first
- Check browser console for errors

### Issue: "Images not loading"
**Solution:**
- Check image paths in database
- Verify static file serving
- Check build folder includes images

### Issue: "CORS errors"
**Solution:**
- Update `CLIENT_URL` in .env
- Check CORS configuration in server.js
- Verify frontend is making requests to correct API URL

---

## 📞 Support Resources

- **Render Docs**: https://render.com/docs
- **Heroku Docs**: https://devcenter.heroku.com/
- **MongoDB Atlas**: https://docs.atlas.mongodb.com/
- **Razorpay Docs**: https://razorpay.com/docs/
- **Shiprocket API**: https://apidocs.shiprocket.in/

---

## 🎉 You're Ready to Deploy!

Follow the steps for your chosen platform and your app will be live!

**Recommended for beginners**: Start with **Render** (free tier)
**Recommended for production**: **Railway** or **DigitalOcean**
