import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CheckoutAuthModal from '../components/CheckoutAuthModal';
import { FiLock, FiTruck, FiCheckCircle, FiUser, FiX } from 'react-icons/fi';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart, mergeGuestCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [pincodeChecking, setPincodeChecking] = useState(false);
  const [serviceable, setServiceable] = useState(null);
  const [shippingQuote, setShippingQuote] = useState(null);
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isGuestCheckout, setIsGuestCheckout] = useState(false);
  const [guestVerificationToken, setGuestVerificationToken] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    pincode: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    paymentMethod: 'COD'
  });

  const shipping = shippingQuote;
  const discount = formData.paymentMethod === 'PREPAID' ? 25 : 0;
  const total = cartTotal + (shipping ?? 0) - discount;

  const getCartWeight = () => {
    const weight = cartItems.reduce((sum, item) => {
      const match = String(item.variant || '').match(/(\d+(?:\.\d+)?)\s*(kg|g)/i);
      if (!match) return sum;

      const value = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      const weightInKg = unit === 'kg' ? value : value / 1000;

      return sum + (weightInKg * (item.quantity || 1));
    }, 0);

    return Math.max(weight, 0.5);
  };

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }

    // If user is not authenticated, show auth modal
    if (!isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [cartItems.length, navigate, isAuthenticated]);

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || prev.fullName,
        phone: user.phone || prev.phone,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === 'pincode' ? value.replace(/\D/g, '').slice(0, 6) : value;

    setFormData({ ...formData, [name]: nextValue });

    if (name === 'pincode' || name === 'paymentMethod') {
      setServiceable(null);
      setShippingQuote(null);
      setSelectedCourier(null);
    }
  };

  const checkPincode = async () => {
    if (formData.pincode.length !== 6) {
      toast.error('Please enter valid 6-digit pincode');
      return;
    }

    setPincodeChecking(true);
    try {
      const { data } = await axios.get('/api/shipping/serviceability', {
        params: {
          pickup_postcode: '413005',
          delivery_postcode: formData.pincode,
          weight: getCartWeight(),
          cod: formData.paymentMethod === 'COD' ? 1 : 0
        }
      });

      const getCourierCharge = (courier) => {
        const freight = Number(courier.freightCharges);
        const codCharge = formData.paymentMethod === 'COD' ? Number(courier.codCharges) || 0 : 0;

        return freight + codCharge;
      };
      const cheapestCourier = data.couriers
        ?.filter(courier => Number.isFinite(Number(courier.freightCharges)) && getCourierCharge(courier) > 0)
        .sort((a, b) => getCourierCharge(a) - getCourierCharge(b))[0];
      const isServiceable = Boolean((data.serviceable ?? (data.couriers?.length > 0)) && cheapestCourier);

      setServiceable(isServiceable);
      setSelectedCourier(cheapestCourier || null);
      setShippingQuote(
        isServiceable && cheapestCourier
          ? Math.ceil(getCourierCharge(cheapestCourier))
          : null
      );

      if (isServiceable) {
        toast.success('✓ Delivery available in 3-5 days');
      } else {
        toast.error('Sorry, we don\'t deliver to this pincode yet');
      }
    } catch (error) {
      toast.error('Error checking pincode');
    } finally {
      setPincodeChecking(false);
    }
  };

  const handleGuestCheckout = async (authResult) => {
    try {
      setIsGuestCheckout(true);
      setGuestVerificationToken(authResult.guestVerificationToken || '');
      setFormData(prev => ({
        ...prev,
        phone: authResult.verifiedPhone || prev.phone
      }));
      
      toast.success('Phone verified! You can now complete your order.');
    } catch (error) {
      console.error('Guest checkout error:', error);
      toast.error('Failed to setup guest checkout');
    }
  };

  const handleLoginSuccess = async (authResult) => {
    try {
      // Merge guest cart with user cart
      await mergeGuestCart();
      toast.success('Welcome back! Your cart has been updated.');
    } catch (error) {
      console.error('Login success error:', error);
      toast.error('Login successful, but failed to merge cart');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is authenticated or in guest checkout mode
    if (!isAuthenticated && !isGuestCheckout) {
      setShowAuthModal(true);
      return;
    }
    
    if (!serviceable) {
      toast.error('⚠️ Please click the CHECK button next to pincode first!', {
        position: 'top-center',
        autoClose: 5000,
        style: { fontSize: '16px', fontWeight: 'bold' }
      });
      document.querySelector('input[name="pincode"]')?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      return;
    }

    setLoading(true);

    try {
      // Create order
      const orderData = {
        items: cartItems
          .map(item => ({
            product: item.product._id,
            name: item.product.name,
            variant: item.variant,
            price: item.price,
            quantity: item.quantity,
            sku: item.product.variants.find(v => v.weight === item.variant)?.sku
          })),
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          landmark: formData.landmark,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        },
        paymentMethod: formData.paymentMethod,
        isGuestOrder: isGuestCheckout,
        guestVerificationToken: isGuestCheckout ? guestVerificationToken : undefined,
        guestDetails: isGuestCheckout ? {
          name: formData.fullName,
          phone: formData.phone,
          email: formData.email
        } : null
      };

      const { data } = await axios.post('/api/orders/create', orderData);

      if (formData.paymentMethod === 'PREPAID') {
        // Initiate Razorpay payment
        const paymentData = await axios.post('/api/payment/create-order', {
          orderId: data.order.orderId,
          amount: data.order.pricing.total
        });

        const options = {
          key: paymentData.data.keyId,
          amount: paymentData.data.amount,
          currency: 'INR',
          name: 'Shriyash Foods',
          description: 'Health Powders',
          order_id: paymentData.data.razorpayOrderId,
          prefill: {
            name: formData.fullName,
            email: formData.email,
            contact: formData.phone
          },
          theme: { color: '#24470b' },
          handler: async function (response) {
            try {
              await axios.post('/api/payment/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: data.order.orderId
              });
              
              clearCart();
              navigate(`/order-success/${data.order.orderId}`);
            } catch (error) {
              toast.error('Payment verification failed');
            }
          },
          modal: {
            ondismiss: function() {
              toast.info('Payment cancelled');
              setLoading(false);
            }
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        // COD order
        clearCart();
        navigate(`/order-success/${data.order.orderId}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Order creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-header">
          <h1>Checkout</h1>
          {isAuthenticated && (
            <div className="user-info">
              <FiUser />
              <span>Logged in as {user?.phone}</span>
            </div>
          )}
          {isGuestCheckout && (
            <div className="guest-info">
              <span>Guest Checkout</span>
            </div>
          )}
        </div>
        
        <div className="checkout-grid">
          <div className="checkout-form">
            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h2>📍 Delivery Details</h2>

                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number * (for delivery updates)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    pattern="[0-9]{10}"
                    required
                    disabled={isAuthenticated || isGuestCheckout}
                  />
                </div>

                <div className="form-group">
                  <label>Email (for order confirmation)</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Complete Address *</label>
                  <input
                    type="text"
                    name="addressLine1"
                    placeholder="House No, Building Name"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="text"
                    name="addressLine2"
                    placeholder="Road Name, Area"
                    value={formData.addressLine2}
                    onChange={handleChange}
                    style={{ marginTop: '8px' }}
                  />
                </div>

                <div className="form-group">
                  <label>Landmark (helps delivery)</label>
                  <input
                    type="text"
                    name="landmark"
                    placeholder="Near..."
                    value={formData.landmark}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>State *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group pincode-section">
                  <label>📍 Pincode * (Check Delivery Availability)</label>
                  <div className="pincode-check">
                    <input
                      type="text"
                      name="pincode"
                      placeholder="Enter 6-digit Pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      maxLength="6"
                      required
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className={
                        formData.pincode.length === 6 
                          ? serviceable === true 
                            ? 'valid' 
                            : serviceable === false 
                              ? 'invalid' 
                              : ''
                          : ''
                      }
                    />
                    <button 
                      type="button" 
                      onClick={checkPincode}
                      disabled={pincodeChecking || formData.pincode.length !== 6}
                      className="btn btn-outline"
                    >
                      {pincodeChecking ? (
                        <>
                          <span className="spinner"></span>
                          Checking...
                        </>
                      ) : (
                        <>
                          <FiCheckCircle />
                          Check
                        </>
                      )}
                    </button>
                  </div>
                  
                  {serviceable === true && (
                    <div className="serviceable-msg">
                      <FiCheckCircle /> Delivery available in 3-5 days
                    </div>
                  )}

                  {serviceable === false && (
                    <div className="not-serviceable-msg">
                      <FiX /> Sorry, we don't deliver to this pincode yet
                    </div>
                  )}
                </div>
              </div>

              <div className="form-section">
                <h2>💳 Payment Method</h2>
                
                <div className="payment-options">
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="PREPAID"
                      checked={formData.paymentMethod === 'PREPAID'}
                      onChange={handleChange}
                    />
                    <div className="payment-details">
                      <strong>Pay Online (UPI/Card/Wallet)</strong>
                      <span className="discount-badge">💰 Save ₹25</span>
                      <small>🔒 100% Secure Payment</small>
                    </div>
                  </label>

                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={formData.paymentMethod === 'COD'}
                      onChange={handleChange}
                    />
                    <div className="payment-details">
                      <strong>Cash on Delivery</strong>
                      <small>📱 Phone verification required</small>
                    </div>
                  </label>
                </div>
              </div>

              {!serviceable && (
                <div style={{
                  padding: '12px',
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffc107',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  textAlign: 'center',
                  color: '#856404'
                }}>
                  ⚠️ Please click the <strong>CHECK</strong> button next to pincode before placing order
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary btn-block"
                disabled={loading || !serviceable || (!isAuthenticated && !isGuestCheckout)}
                title={!serviceable ? 'Please check pincode serviceability first' : ''}
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>

              <div className="trust-badges">
                <div><FiLock /> Safe & Secure Checkout</div>
                <div><FiCheckCircle /> 100% Authentic Products</div>
                <div><FiTruck /> Fast Delivery</div>
              </div>
            </form>
          </div>

          <div className="order-summary">
            <h2>📦 Order Summary</h2>
            
            {cartItems
              .map(item => (
                <div key={item._id} className="summary-item">
                  <span>{item.product.name} ({item.variant})</span>
                  <span>₹{item.price} × {item.quantity}</span>
                </div>
              ))}

            <div className="summary-divider"></div>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{cartTotal}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === null ? 'Check pincode' : `\u20B9${shipping}`}</span>
            </div>

            {selectedCourier && (
              <div className="summary-row">
                <span>Courier</span>
                <span>{selectedCourier.name || 'Shiprocket'}</span>
              </div>
            )}

            {discount > 0 && (
              <div className="summary-row discount" style={{
                color: '#28a745',
                fontWeight: '600',
                backgroundColor: '#d4edda',
                padding: '8px',
                borderRadius: '4px',
                margin: '8px 0'
              }}>
                <span>💰 Prepaid Discount</span>
                <span>-₹{discount}</span>
              </div>
            )}

            <div className="summary-divider"></div>

            <div className="summary-total">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>
        </div>
      </div>

      <CheckoutAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onGuestCheckout={handleGuestCheckout}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default Checkout;
