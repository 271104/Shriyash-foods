import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import {
  FiArrowRight,
  FiAward,
  FiCheck,
  FiChevronRight,
  FiClock,
  FiHeart,
  FiMinus,
  FiPackage,
  FiPlus,
  FiShield,
  FiShoppingCart,
  FiStar,
  FiTruck,
  FiZap
} from 'react-icons/fi';
import './ProductDetail.css';

const fallbackRelatedProducts = [
  {
    _id: 'abc-powder',
    name: 'ABC Powder',
    slug: 'abc-powder',
    images: [{ url: '/abc-removebg-preview.png' }],
    variants: [{ price: 249, mrp: 299 }]
  },
  {
    _id: 'beetroot-powder',
    name: 'Beetroot Powder',
    slug: 'beetroot-powder',
    images: [{ url: '/beetroot-removebg-preview.png' }],
    variants: [{ price: 199, mrp: 249 }]
  },
  {
    _id: 'banana-powder',
    name: 'Banana Powder',
    slug: 'banana-powder',
    images: [{ url: '/banana-removebg-preview.png' }],
    variants: [{ price: 199, mrp: 249 }]
  },
  {
    _id: 'tomato-powder',
    name: 'Tomato Powder',
    slug: 'tomato-powder',
    images: [{ url: '/tomato-removebg-preview.png' }],
    variants: [{ price: 10, mrp: 249 }]
  },
  {
    _id: 'onion-powder',
    name: 'Onion Powder',
    slug: 'onion-powder',
    images: [{ url: '/onion-removebg-preview.png' }],
    variants: [{ price: 199, mrp: 249 }]
  },
  {
    _id: 'moringa-powder',
    name: 'Moringa Powder',
    slug: 'moringa-powder',
    images: [{ url: '/moringa-removebg-preview.png' }],
    variants: [{ price: 249, mrp: 299 }]
  }
];

const getDiscount = (variant) => {
  if (!variant?.mrp || variant.mrp <= variant.price) return 0;
  return Math.round(((variant.mrp - variant.price) / variant.mrp) * 100);
};

const getProductCategory = (product) => {
  const text = `${product?.slug || ''} ${product?.name || ''}`.toLowerCase();
  if (text.includes('moringa')) return { label: 'Green Powders', hash: 'green-powder' };
  if (text.includes('onion') || text.includes('beetroot')) return { label: 'Vegetable Powders', hash: 'vegetables' };
  return { label: 'Fruit Powders', hash: 'fruits' };
};

const isStandaloneCarrotProduct = (product) => {
  const searchable = `${product?.slug || ''} ${product?.name || ''}`.toLowerCase();
  return searchable.includes('carrot-powder') || searchable === 'carrot powder';
};

const getProductTone = (productName = '') => {
  const text = productName.toLowerCase();

  if (text.includes('moringa')) {
    return {
      hero: '/moringa-removebg-preview.png',
      whyTitle: 'Why Choose Moringa Powder?',
      benefits: [
        'Rich in vitamins and minerals',
        'Supports immunity and overall wellness',
        'Natural energy booster',
        'Helps improve digestion',
        'Rich in antioxidants',
        'Supports healthy skin and hair'
      ],
      nutrients: [
        ['Protein', '27g'],
        ['Iron', '28.2mg'],
        ['Fiber', '19.2g'],
        ['Calcium', '440mg'],
        ['Vitamin A', '6780 IU'],
        ['Vitamin C', '17.3mg']
      ]
    };
  }

  if (text.includes('beetroot')) {
    return {
      hero: '/beetroot-removebg-preview.png',
      whyTitle: 'Why Choose Beetroot Powder?',
      benefits: [
        'Supports stamina and natural energy',
        'Rich in iron and antioxidants',
        'Helps support blood circulation',
        'Adds natural color to recipes',
        'Useful for smoothies and juices',
        'Supports everyday wellness'
      ],
      nutrients: [
        ['Iron', 'Good source'],
        ['Fiber', 'High'],
        ['Nitrates', 'Natural'],
        ['Folate', 'Present'],
        ['Potassium', 'Rich'],
        ['Antioxidants', 'High']
      ]
    };
  }

  if (text.includes('banana')) {
    return {
      hero: '/banana-removebg-preview.png',
      whyTitle: 'Why Choose Banana Powder?',
      benefits: [
        'Natural source of energy',
        'Rich banana flavor',
        'Easy to mix in shakes',
        'Supports healthy snacking',
        'Naturally sweet and convenient',
        'Good for quick recipes'
      ],
      nutrients: [
        ['Energy', 'Natural'],
        ['Potassium', 'Rich'],
        ['Fiber', 'Present'],
        ['Carbs', 'Natural'],
        ['Taste', 'Sweet'],
        ['Use', 'Daily']
      ]
    };
  }

  if (text.includes('onion')) {
    return {
      hero: '/onion-removebg-preview.png',
      whyTitle: 'Why Choose Onion Powder?',
      benefits: [
        'Enhances flavor naturally',
        'Convenient replacement for onion',
        'Useful in curries and snacks',
        'No peeling or chopping needed',
        'Easy to store and use',
        'Adds depth to everyday cooking'
      ],
      nutrients: [
        ['Flavor', 'Strong'],
        ['Use', 'Cooking'],
        ['Storage', 'Easy'],
        ['Prep Time', 'Low'],
        ['Texture', 'Fine'],
        ['Convenience', 'High']
      ]
    };
  }

  if (text.includes('tomato')) {
    return {
      hero: '/tomato-removebg-preview.png',
      whyTitle: 'Why Choose Tomato Powder?',
      benefits: [
        'Rich tomato taste',
        'Convenient replacement for fresh tomato',
        'Useful in gravies and soups',
        'Supports quick cooking',
        'Naturally rich in lycopene',
        'Adds color and flavor'
      ],
      nutrients: [
        ['Lycopene', 'Rich'],
        ['Vitamin C', 'Present'],
        ['Flavor', 'Tangy'],
        ['Use', 'Cooking'],
        ['Color', 'Natural'],
        ['Storage', 'Easy']
      ]
    };
  }

  return {
    hero: '/abc-removebg-preview.png',
    whyTitle: `Why Choose ${productName}?`,
    benefits: [
      'Made from carefully selected produce',
      'Convenient for daily nutrition',
      'Easy to mix with drinks and meals',
      'No additives or preservatives',
      'Naturally flavorful',
      'Packed with wholesome goodness'
    ],
    nutrients: [
      ['Vitamins', 'Rich'],
      ['Fiber', 'Present'],
      ['Taste', 'Natural'],
      ['Energy', 'Daily'],
      ['Quality', 'Premium'],
      ['Purity', '100%']
    ]
  };
};

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProduct = async () => {
    setLoading(true);

    try {
      const { data } = await axios.get(`/products/${slug}`);
      setProduct(data.product);
      setSelectedVariant(data.product.variants?.[0] || null);
      fetchRelatedProducts(data.product.slug);
    } catch (error) {
      toast.error('Product not found');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (currentSlug) => {
    try {
      const { data } = await axios.get('/products');
      const products = data.products?.length ? data.products : fallbackRelatedProducts;
      setRelatedProducts(products
        .filter(item => item.slug !== currentSlug && !isStandaloneCarrotProduct(item))
        .slice(0, 6));
    } catch (error) {
      setRelatedProducts(fallbackRelatedProducts
        .filter(item => item.slug !== currentSlug && !isStandaloneCarrotProduct(item))
        .slice(0, 6));
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error('Please select a variant');
      return false;
    }

    setAdding(true);
    try {
      await addToCart(product._id, selectedVariant.weight, quantity);
      toast.success('Added to cart!');
      return true;
    } catch (error) {
      toast.error('Failed to add to cart');
      return false;
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    const added = await handleAddToCart();
    if (added) navigate('/checkout');
  };

  const productTone = useMemo(() => getProductTone(product?.name), [product]);
  const category = useMemo(() => getProductCategory(product), [product]);
  const discount = getDiscount(selectedVariant);
  const imageUrl = product?.images?.[0]?.url || productTone.hero || '/placeholder.jpg';
  const methods = product?.howToConsume?.length
    ? product.howToConsume
    : ['Take 1 teaspoon (3-5g)', 'Mix in water, juice or smoothies', 'Drink daily for best results'];
  const benefits = product?.benefits?.length ? product.benefits : productTone.benefits;

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="product-detail-page">
      <div className="product-leaf product-leaf-left"></div>
      <div className="product-leaf product-leaf-right"></div>

      <div className="product-detail-container">
        <nav className="product-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>&gt;</span>
          <Link to="/products">Shop</Link>
          <span>&gt;</span>
          <Link to={`/products#${category.hash}`}>{category.label}</Link>
          <span>&gt;</span>
          <strong>{product.name}</strong>
        </nav>

        <section className="product-hero-detail">
          <aside className="product-thumbs" aria-label="Product images">
            <button type="button" className="thumb-arrow"><FiChevronRight /></button>
            {[imageUrl, productTone.hero, '/green_powder.png'].map((image, index) => (
              <button type="button" className={`thumb-card ${index === 0 ? 'active' : ''}`} key={`${image}-${index}`}>
                <img src={image} alt={`${product.name} view ${index + 1}`} />
              </button>
            ))}
            <button type="button" className="thumb-arrow"><FiChevronRight /></button>
          </aside>

          <div className="product-main-image">
            <img src={imageUrl} alt={product.name} />
            <button type="button" className="image-expand" aria-label="Expand image">
              <FiArrowRight />
            </button>
          </div>

          <div className="product-details">
            <h1>{product.name}</h1>

            <div className="product-rating">
              {[1, 2, 3, 4, 5].map(star => <FiStar key={star} />)}
              <strong>4.9</strong>
              <span>(124 Reviews)</span>
            </div>

            <p className="product-description">{product.description}</p>

            <div className="product-mini-benefits">
              <span><FiAward /> Nutrient Rich</span>
              <span><FiShield /> Immunity Booster</span>
              <span><FiZap /> Natural Energy</span>
              <span><FiHeart /> Detox &amp; Cleanse</span>
            </div>

            {selectedVariant && (
              <div className="price-section">
                <span className="price">&#8377;{selectedVariant.price}</span>
                {selectedVariant.mrp > selectedVariant.price && (
                  <>
                    <span className="mrp">&#8377;{selectedVariant.mrp}</span>
                    <span className="discount">{discount}% OFF</span>
                  </>
                )}
              </div>
            )}
            <p className="tax-note">(Inclusive of all taxes)</p>

            <div className="variant-selector">
              <label>Select Size:</label>
              <div className="variants">
                {product.variants.map(variant => (
                  <button
                    key={variant._id || variant.weight}
                    className={`variant-btn ${selectedVariant?._id === variant._id || selectedVariant?.weight === variant.weight ? 'active' : ''}`}
                    onClick={() => setSelectedVariant(variant)}
                    type="button"
                  >
                    {variant.weight}
                  </button>
                ))}
              </div>
            </div>

            <div className="quantity-selector">
              <label>Quantity:</label>
              <div className="quantity-controls">
                <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}><FiMinus /></button>
                <span>{quantity}</span>
                <button type="button" onClick={() => setQuantity(quantity + 1)}><FiPlus /></button>
              </div>
            </div>

            <div className="product-actions">
              <button onClick={handleAddToCart} disabled={adding} className="detail-cart-btn" type="button">
                <FiShoppingCart />
                {adding ? 'Adding...' : 'Add to Cart'}
              </button>
              <button onClick={handleBuyNow} disabled={adding} className="detail-buy-btn" type="button">
                <FiZap />
                Buy Now
              </button>
            </div>

            <div className="purchase-assurance">
              <span><FiShield /> Secure Payment</span>
              <span><FiClock /> Easy Returns</span>
              <span><FiTruck /> Free Shipping <small>on orders above &#8377;499</small></span>
            </div>
          </div>
        </section>

        <section className="detail-trust-strip" aria-label="Product trust markers">
          <span><FiAward /> 100% Natural Ingredients</span>
          <span><FiZap /> No Additives No Preservatives</span>
          <span><FiShield /> Lab Tested for Purity</span>
          <span><FiPackage /> Secure Packaging</span>
          <span><FiTruck /> Fast &amp; Safe Delivery</span>
        </section>

        <section className="why-product">
          <div>
            <h2>{productTone.whyTitle}</h2>
            <ul>
              {benefits.slice(0, 6).map((benefit, index) => (
                <li key={index}><FiCheck /> {benefit}</li>
              ))}
            </ul>
          </div>
          <img src={productTone.hero} alt={`${product.name} serving suggestion`} />
        </section>

        <section className="detail-info-grid">
          <article className="detail-card how-card">
            <h2>How to Use</h2>
            <div className="steps-row">
              {methods.slice(0, 3).map((method, index) => (
                <div className="step-item" key={index}>
                  <span>{index + 1}</span>
                  <strong>Step {index + 1}</strong>
                  <p>{method}</p>
                </div>
              ))}
            </div>
            <div className="best-time">Best time to consume: Morning or before meals</div>
          </article>

        </section>

        {relatedProducts.length > 0 && (
          <section className="related-products">
            <h2>You May Also Like</h2>
            <div className="related-grid">
              {relatedProducts.map(item => {
                const variant = item.variants?.[0] || { price: 0, mrp: 0 };
                const itemDiscount = getDiscount(variant);

                return (
                  <Link to={`/products/${item.slug}`} className="related-card" key={item._id || item.slug}>
                    {itemDiscount > 0 && <span className="related-discount">{itemDiscount}% OFF</span>}
                    <img src={item.images?.[0]?.url || '/placeholder.jpg'} alt={item.name} />
                    <strong>{item.name}</strong>
                    <div>
                      <span>&#8377;{variant.price}</span>
                      {variant.mrp > variant.price && <small>&#8377;{variant.mrp}</small>}
                    </div>
                    <em><FiShoppingCart /> Add to Cart</em>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <section className="delivery-strip">
          <span><FiTruck /> <strong>Fast Delivery</strong><small>Delivered in 3-5 working days</small></span>
          <span><FiPackage /> <strong>Secure Packaging</strong><small>Your product is packed with care</small></span>
          <span><FiClock /> <strong>Easy Returns</strong><small>Hassle-free return policy</small></span>
          <span><FiHeart /> <strong>Order Tracking</strong><small>Track your order in real-time</small></span>
        </section>
      </div>
    </div>
  );
};

export default ProductDetail;
