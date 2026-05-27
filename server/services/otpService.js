const axios = require('axios');
const OTP = require('../models/OTP');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const checkRateLimit = async (phone) => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentRequests = await OTP.countDocuments({
    phone,
    createdAt: { $gte: oneHourAgo }
  });

  if (recentRequests >= 5) {
    throw new Error('Too many OTP requests. Try again in 60 minutes.');
  }

  return true;
};

const sendWhatsAppOTP = async (phone, otp) => {
  try {
    const apiKey = process.env.WASENDER_API_KEY;
    const baseUrl = process.env.WASENDER_API_URL || 'https://www.wasenderapi.com';

    if (!apiKey) {
      throw new Error('WasenderAPI key not configured');
    }

    const response = await axios.post(
      `${baseUrl.replace(/\/$/, '')}/api/send-message`,
      {
        to: `+91${phone}`,
        text: `Your Shriyash Foods OTP is: ${otp}\n\nValid for 5 minutes. Do not share this code with anyone.\n\n- Team Shriyash Foods`
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data?.success === false) {
      throw new Error(response.data?.message || 'WasenderAPI rejected the OTP message');
    }

    return {
      success: true,
      messageId: response.data?.data?.msgId || response.data?.messageId || response.data?.id
    };
  } catch (error) {
    console.error('WasenderAPI OTP failed:', error.response?.data || error.message);
    throw error;
  }
};

const sendSMSOTP = async (phone, otp) => {
  try {
    const msg91AuthKey = process.env.MSG91_AUTH_KEY;
    const msg91TemplateId = process.env.MSG91_TEMPLATE_ID;

    if (msg91AuthKey && msg91TemplateId) {
      const response = await axios.post('https://api.msg91.com/api/v5/otp', {
        mobile: `91${phone}`,
        template_id: msg91TemplateId,
        otp
      }, {
        headers: {
          authkey: msg91AuthKey,
          'Content-Type': 'application/json'
        }
      });

      console.log(`SMS OTP sent via MSG91 to ${phone}`);
      return { success: true, messageId: response.data.request_id };
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`SMS OTP for ${phone}: ${otp} (console fallback)`);
      return { success: true, messageId: 'console_fallback' };
    }

    throw new Error('SMS fallback is not configured');
  } catch (error) {
    console.error('SMS OTP failed:', error.response?.data || error.message);
    throw error;
  }
};

const sendOTP = async (phone, purpose = 'login') => {
  try {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      throw new Error('Invalid phone number format');
    }

    await checkRateLimit(phone);

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await OTP.deleteMany({ phone, purpose });
    await OTP.create({ phone, otp, purpose, expiresAt });

    let messageId = null;

    if (process.env.NODE_ENV === 'development') {
      console.log(`OTP for ${phone}: ${otp} (development mode)`);
      messageId = 'dev_console';
    } else {
      try {
        const whatsappResult = await sendWhatsAppOTP(phone, otp);
        messageId = whatsappResult.messageId;
        console.log(`WhatsApp OTP sent via WasenderAPI to ${phone}`);
      } catch (whatsappError) {
        console.log(`WasenderAPI failed for ${phone}, trying SMS fallback...`);
        const smsResult = await sendSMSOTP(phone, otp);
        messageId = smsResult.messageId;
      }
    }

    return {
      success: true,
      message: 'OTP sent successfully',
      messageId,
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    };
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

const verifyOTP = async (phone, otp, purpose = 'login') => {
  try {
    const otpRecord = await OTP.findOne({
      phone,
      purpose,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return {
        success: false,
        message: 'OTP not found or expired. Please request a new OTP.'
      };
    }

    if (otpRecord.attempts >= 3) {
      await OTP.updateOne(
        { _id: otpRecord._id },
        { $set: { isUsed: true } }
      );
      return {
        success: false,
        message: 'Maximum OTP attempts exceeded. Please request a new OTP.'
      };
    }

    if (otpRecord.otp !== otp) {
      await OTP.updateOne(
        { _id: otpRecord._id },
        { $inc: { attempts: 1 } }
      );
      return {
        success: false,
        message: `Invalid OTP. ${3 - otpRecord.attempts - 1} attempts remaining.`
      };
    }

    await OTP.updateOne(
      { _id: otpRecord._id },
      { $set: { isUsed: true } }
    );

    return {
      success: true,
      message: 'OTP verified successfully'
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw new Error('OTP verification failed');
  }
};

const cleanupExpiredOTPs = async () => {
  try {
    const result = await OTP.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    console.log(`Cleaned up ${result.deletedCount} expired OTPs`);
  } catch (error) {
    console.error('Error cleaning up OTPs:', error);
  }
};

setInterval(cleanupExpiredOTPs, 10 * 60 * 1000);

module.exports = {
  sendOTP,
  verifyOTP,
  cleanupExpiredOTPs
};
