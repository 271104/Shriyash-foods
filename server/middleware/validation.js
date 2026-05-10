// Input validation middleware

const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

const validateEmail = (email) => {
  if (!email) return true; // Email is optional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePincode = (pincode) => {
  const pincodeRegex = /^[0-9]{6}$/;
  return pincodeRegex.test(pincode);
};

const validateOrderData = (req, res, next) => {
  const { items, shippingAddress, paymentMethod } = req.body;

  // Validate items
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Order must contain at least one item' 
    });
  }

  // Validate shipping address
  if (!shippingAddress) {
    return res.status(400).json({ 
      success: false, 
      message: 'Shipping address is required' 
    });
  }

  const { fullName, phone, addressLine1, city, state, pincode } = shippingAddress;

  if (!fullName || fullName.trim().length < 2) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide a valid full name' 
    });
  }

  if (!validatePhone(phone)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide a valid 10-digit phone number' 
    });
  }

  if (!addressLine1 || addressLine1.trim().length < 5) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide a complete address' 
    });
  }

  if (!city || city.trim().length < 2) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide a valid city name' 
    });
  }

  if (!state || state.trim().length < 2) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide a valid state name' 
    });
  }

  if (!validatePincode(pincode)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide a valid 6-digit pincode' 
    });
  }

  // Validate payment method
  if (!paymentMethod || !['COD', 'PREPAID'].includes(paymentMethod)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please select a valid payment method' 
    });
  }

  next();
};

const validateRegistration = (req, res, next) => {
  const { name, phone, password } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide a valid name (minimum 2 characters)' 
    });
  }

  if (!validatePhone(phone)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide a valid 10-digit phone number' 
    });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ 
      success: false, 
      message: 'Password must be at least 6 characters long' 
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { phone, password } = req.body;

  if (!validatePhone(phone)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide a valid 10-digit phone number' 
    });
  }

  if (!password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Password is required' 
    });
  }

  next();
};

module.exports = {
  validateOrderData,
  validateRegistration,
  validateLogin,
  validatePhone,
  validateEmail,
  validatePincode
};
