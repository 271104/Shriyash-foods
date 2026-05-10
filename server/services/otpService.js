// Store OTPs temporarily (in production, use Redis)
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP (Development mode - logs to console)
const sendOTP = async (phoneNumber) => {
  try {
    const otp = generateOTP();
    const expiryTime = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP with expiry
    otpStore.set(phoneNumber, { otp, expiryTime });

    // In development, log OTP to console
    console.log(`\n🔐 OTP for ${phoneNumber}: ${otp}`);
    console.log(`⏰ Expires in 10 minutes\n`);

    // TODO: In production, integrate SMS service (MSG91, Twilio, etc.)
    // Example with MSG91:
    // const response = await axios.post('https://api.msg91.com/api/v5/otp', {
    //   mobile: phoneNumber,
    //   otp: otp
    // });

    return { 
      success: true, 
      message: 'OTP sent successfully',
      // Only return OTP in development
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    };
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Failed to send OTP. Please try again.');
  }
};

// Verify OTP
const verifyOTP = (phoneNumber, otp) => {
  const storedData = otpStore.get(phoneNumber);

  if (!storedData) {
    return { success: false, message: 'OTP not found or expired' };
  }

  const { otp: storedOTP, expiryTime } = storedData;

  // Check if OTP expired
  if (Date.now() > expiryTime) {
    otpStore.delete(phoneNumber);
    return { success: false, message: 'OTP has expired' };
  }

  // Verify OTP
  if (storedOTP === otp) {
    otpStore.delete(phoneNumber);
    return { success: true, message: 'OTP verified successfully' };
  }

  return { success: false, message: 'Invalid OTP' };
};

// Clean up expired OTPs periodically
setInterval(() => {
  const now = Date.now();
  for (const [phone, data] of otpStore.entries()) {
    if (now > data.expiryTime) {
      otpStore.delete(phone);
    }
  }
}, 60000); // Clean every minute

module.exports = {
  sendOTP,
  verifyOTP
};
