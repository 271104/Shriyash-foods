import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { FiLock, FiTruck, FiCheckCircle } from 'react-icons/fi';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useContext(CartContext);
  
  const [loading, setLoading] = useState(false);
  const [pincodeChecking, setPincodeChecking] = useState(false);
  const [serviceable, setServiceable] = useState(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    pincode: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    paymentMethod: 'COD'
  });

  const shipping = cartTotal >= 500 ? 0 : 40;
  const discount = formData.paymentMethod === 'PREPAID' ? 25 : 0;
  const total = cartTotal + shipping - discount;

  useEffect(() => {
    if (cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const checkPincode = async () => {
    if (formData.pincode.length !== 6) {
      toast.error('Please enter valid 6-digit pincode');
      return;
    }

    setPincodeChecking(true);
    try {
      const { data } = await axios.post('/api/shipping/check-serviceability', {
        pincode: formData.pincode
      });
      
      setServiceable(data.serviceable);
      
      if (data.serviceable) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!serviceable) {
      toast.error('⚠️ Please click the CHECK button next to pincode first!', {
        position: 'top-center',
        autoClose: 5000,
        style: { fontSize: '16px', fontWeight: 'bold' }
      });
      // Scroll to pincode field
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
        items: cart.items
          .filter(item => item.product) // Filter out items with null products
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
        guestDetails: {
          name: formData.fullName,
          phone: formData.phone,
          email: formData.email
        }
      };

      const { data } = await axios.post('/api/orders/create', orderData);

      if (formData.paymentMethod === 'PREPAID') {
        // Initiate Razorpay payment
        const paymentData = await axios.post('/api/payment/create-order', {
          orderId: data.order.orderId,
          amount: total
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
          theme: { color: '#D4A574' },
          method: 'upi',
          config: {
            display: {
              blocks: {
                upiPreferred: {
                  name: 'Pay using UPI',
                  instruments: [
                    {
                      method: 'upi',
                      flows: ['qr', 'collect', 'intent']
                    }
                  ]
                },
                card: {
                  name: 'Credit/Debit Card',
                  instruments: [
                    {
                      method: 'card'
                    }
                  ]
                },
                netbanking: {
                  name: 'Netbanking',
                  instruments: [
                    {
                      method: 'netbanking'
                    }
                  ]
                },
                wallet: {
                  name: 'Wallets',
                  instruments: [
                    {
                      method: 'wallet'
                    }
                  ]
                }
              },
              sequence: ['block.upiPreferred', 'block.card', 'block.netbanking', 'block.wallet'],
              preferences: {
                show_default_blocks: false
              }
            }
          },
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
        // COD order - check if OTP required
        if (data.requiresOTP) {
          // Show OTP modal
          const otp = prompt('Enter OTP sent to your phone:');
          if (otp) {
            await axios.post(`/api/orders/${data.order.orderId}/verify-otp`, { otp });
          }
        }
        
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
        <h1>Checkout</h1>
        
        <div className="checkout-grid">
          <div className="checkout-form">
            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h2>📍 Delivery Details</h2>
                
                <div className="pincode-check">
                  <input
                    type="text"
                    name="pincode"
                    placeholder="Enter Pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    maxLength="6"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={checkPincode}
                    disabled={pincodeChecking}
                    className="btn btn-outline"
                  >
                    {pincodeChecking ? 'Checking...' : 'Check'}
                  </button>
                </div>
                
                {serviceable && (
                  <div className="serviceable-msg">
                    <FiCheckCircle /> Delivery available in 3-5 days
                  </div>
                )}

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
                      <small>📱 OTP verification required</small>
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
                disabled={loading || !serviceable}
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
            
            {cart.items
              .filter(item => item.product) // Filter out null products
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
              <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
            </div>

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

            {cartTotal < 500 && (
              <div className="free-shipping-msg">
                Add ₹{500 - cartTotal} more for FREE shipping!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
