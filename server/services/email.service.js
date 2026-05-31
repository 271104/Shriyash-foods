const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;
  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT) || 587,
    secure: Number(EMAIL_PORT) === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    }
  });

  return transporter;
};

const isEmailConfigured = () => Boolean(
  process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS
);

const sendEmail = async ({ to, subject, html, text }) => {
  const mailer = getTransporter();
  if (!mailer) {
    console.warn('Email not configured — skipping email send');
    return { success: false, skipped: true, reason: 'not_configured' };
  }

  const info = await mailer.sendMail({
    from: `"Shriyash Foods" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    text
  });

  return { success: true, messageId: info.messageId };
};

module.exports = {
  isEmailConfigured,
  sendEmail
};
