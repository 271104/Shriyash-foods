import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  FiChevronDown,
  FiFilter,
} from 'react-icons/fi';
import './Products.css';

const fallbackProducts = [
  {
    _id: 'tomato-powder',
    name: 'Tomato Powder',
    slug: 'tomato-powder',
    description: 'Premium Tomato Powder - Rich in lycopene & antioxidants that supports immunity, enhances flavor naturally, and serves as a convenient replacement for fresh tomato.',
    images: [{ url: '/tomato-removebg-preview.png' }],
    variants: [{ price: 10, mrp: 249 }]
  },
  {
    _id: 'beetroot-powder',
    name: 'Beetroot Powder',
    slug: 'beetroot-powder',
    description: 'Natural Beetroot Powder - Rich in iron & antioxidants that helps boost immunity, supports stamina & blood circulation, and increases energy naturally.',
    images: [{ url: '/beetroot-removebg-preview.png' }],
    variants: [{ price: 199, mrp: 249 }]
  },
  {
    _id: 'banana-powder',
    name: 'Banana Powder',
    slug: 'banana-powder',
    description: 'Natural Banana Powder - A rich source of natural energy and potassium that supports digestion, helps in healthy weight management, and is naturally sweet & nutritious.',
    images: [{ url: '/banana-removebg-preview.png' }],
    variants: [{ price: 199, mrp: 249 }]
  },
  {
    _id: 'moringa-powder',
    name: 'Moringa Powder',
    slug: 'moringa-powder',
    description: 'Pure Moringa Powder - A nutrient-rich superfood packed with vitamins & minerals that supports overall wellness, improves energy naturally, and boosts immunity.',
    images: [{ url: '/moringa-removebg-preview.png' }],
    variants: [{ price: 249, mrp: 299 }]
  },
  {
    _id: 'curry-leaves-powder',
    name: 'Curry Leaves Powder',
    slug: 'curry-leaves-powder',
    description: 'Natural Curry Leaves Powder - A flavorful green powder made for daily cooking, seasoning, and traditional wellness routines.',
    images: [{ url: '/Curry-Leaves.PNG' }],
    variants: [
      { weight: '150gm', price: 129, mrp: 159 },
      { weight: '250gm', price: 189, mrp: 229 },
      { weight: '500gm', price: 249, mrp: 299 }
    ]
  },
  {
    _id: 'onion-powder',
    name: 'Onion Powder',
    slug: 'onion-powder',
    description: 'Premium Onion Powder - Enhances flavor naturally, rich in antioxidants, supports heart health, and serves as a convenient substitute for fresh onion.',
    images: [{ url: '/onion-removebg-preview.png' }],
    variants: [{ price: 199, mrp: 249 }]
  },
  {
    _id: 'abc-powder',
    name: 'ABC Powder',
    slug: 'abc-powder',
    description: 'ABC Powder (Apple + Beetroot + Carrot) - A powerful blend rich in antioxidants & vitamins that supports immunity, improves energy levels, and promotes overall wellness.',
    images: [{ url: '/abc-removebg-preview.png' }],
    variants: [{ price: 249, mrp: 299 }]
  }
];

const categorySections = [
  {
    id: 'green-powder',
    title: 'Green Powders',
    sidebarLabel: 'Green Powders',
    productKeys: ['moringa', 'curry']
  },
  {
    id: 'fruits',
    title: 'Fruit Powders',
    sidebarLabel: 'Fruit Powders',
    productKeys: ['apple', 'banana', 'tomato', 'abc']
  },
  {
    id: 'vegetables',
    title: 'Vegetable Powders',
    sidebarLabel: 'Vegetable Powders',
    productKeys: ['tomato', 'onion', 'beetroot']
  }
];

const PRICE_MIN = 110;
const PRICE_MAX = 500;
const FILTER_STORAGE_KEY = 'shriyash-products-filters';
const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'discount', label: 'Highest Discount' },
  { value: 'name', label: 'Name: A to Z' }
];

const getSavedFilters = () => {
  if (typeof window === 'undefined') {
    return {
      filtersEnabled: false,
      activeCategory: 'all',
      priceMax: PRICE_MAX,
      sortBy: 'featured'
    };
  }

  try {
    const savedFilters = JSON.parse(window.localStorage.getItem(FILTER_STORAGE_KEY) || '{}');
    const validCategory = ['all', ...categorySections.map(category => category.id)].includes(savedFilters.activeCategory);
    const savedPriceMax = Number(savedFilters.priceMax);
    const filtersEnabled = savedFilters.filtersEnabled === true;

    return {
      filtersEnabled,
      activeCategory: filtersEnabled && validCategory ? savedFilters.activeCategory : 'all',
      priceMax: savedPriceMax >= PRICE_MIN && savedPriceMax <= PRICE_MAX ? savedPriceMax : PRICE_MAX,
      sortBy: SORT_OPTIONS.some(option => option.value === savedFilters.sortBy)
        ? savedFilters.sortBy
        : 'featured'
    };
  } catch (error) {
    return {
      filtersEnabled: false,
      activeCategory: 'all',
      priceMax: PRICE_MAX,
      sortBy: 'featured'
    };
  }
};

const Products = () => {
  const savedFilters = getSavedFilters();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [highlightedCategory, setHighlightedCategory] = useState('');
  const [filtersEnabled, setFiltersEnabled] = useState(savedFilters.filtersEnabled);
  const [activeCategory, setActiveCategory] = useState(savedFilters.activeCategory);
  const [priceMax, setPriceMax] = useState(savedFilters.priceMax);
  const [sortBy, setSortBy] = useState(savedFilters.sortBy);
  const location = useLocation();

  useEffect(() => {
    fetchProducts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    window.localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify({
      filtersEnabled,
      activeCategory,
      priceMax,
      sortBy
    }));
  }, [filtersEnabled, activeCategory, priceMax, sortBy]);

  useEffect(() => {
    if (loading || !location.hash) return undefined;

    const categoryId = location.hash.replace('#', '');
    const target = document.getElementById(categoryId);

    if (!target) return undefined;

    const scrollTimer = setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setHighlightedCategory(categoryId);
    }, 120);

    const highlightTimer = setTimeout(() => {
      setHighlightedCategory('');
    }, 2600);

    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(highlightTimer);
    };
  }, [loading, location.hash, products]);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, observerOptions);

    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, [products]);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('/products');
      setProducts(mergeFallbackProducts(data.products?.length ? data.products : fallbackProducts));
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts(fallbackProducts);
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscount = (mrp, price) => {
    return Math.round(((mrp - price) / mrp) * 100);
  };

  const productMatchesKey = (product, key) => {
    const searchable = `${product.slug || ''} ${product.name || ''}`.toLowerCase();
    return searchable.includes(key);
  };

  const mergeFallbackProducts = (items) => {
    const productsBySlug = new Map(items.map(product => [product.slug, product]));
    fallbackProducts.forEach((product) => {
      if (!productsBySlug.has(product.slug)) {
        productsBySlug.set(product.slug, product);
      }
    });

    return Array.from(productsBySlug.values());
  };

  const getCategoryProducts = (productKeys) => {
    return productKeys
      .map(key => products.find(product => productMatchesKey(product, key)))
      .filter(Boolean);
  };

  const getProductVariants = (product) => {
    return product.variants?.length ? product.variants : [{ price: 0, mrp: 0 }];
  };

  const isVariantInPriceRange = (variant) => {
    if (!filtersEnabled) return true;
    const price = Number(variant.price || 0);
    return price >= PRICE_MIN && price <= priceMax;
  };

  const productMatchesPriceRange = (product) => {
    return getProductVariants(product).some(isVariantInPriceRange);
  };

  const getMatchingVariants = (product) => {
    return getProductVariants(product).filter(isVariantInPriceRange);
  };

  const getVariantDiscount = (variant) => {
    const price = Number(variant?.price || 0);
    const mrp = Number(variant?.mrp || 0);
    return mrp > price ? calculateDiscount(mrp, price) : 0;
  };

  const getMatchingVariant = (product) => {
    const variants = getMatchingVariants(product);
    const fallbackVariant = getProductVariants(product)[0];

    if (!variants.length) return fallbackVariant;
    if (sortBy === 'price-low') {
      return [...variants].sort((a, b) => Number(a.price || 0) - Number(b.price || 0))[0];
    }
    if (sortBy === 'price-high') {
      return [...variants].sort((a, b) => Number(b.price || 0) - Number(a.price || 0))[0];
    }
    if (sortBy === 'discount') {
      return [...variants].sort((a, b) => getVariantDiscount(b) - getVariantDiscount(a))[0];
    }

    return variants[0];
  };

  const getProductPrice = (product) => Number(getMatchingVariant(product)?.price || 0);
  const getProductMrp = (product) => Number(getMatchingVariant(product)?.mrp || 0);
  const getProductDiscount = (product) => {
    const price = getProductPrice(product);
    const mrp = getProductMrp(product);

    return mrp > price ? calculateDiscount(mrp, price) : 0;
  };

  const sortProducts = (items) => {
    return [...items].sort((a, b) => {
      if (sortBy === 'price-low') return getProductPrice(a) - getProductPrice(b);
      if (sortBy === 'price-high') return getProductPrice(b) - getProductPrice(a);
      if (sortBy === 'discount') return getProductDiscount(b) - getProductDiscount(a);
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });
  };

  const filteredSections = categorySections
    .map(category => ({
      ...category,
      products: sortProducts(
        getCategoryProducts(category.productKeys)
          .filter(productMatchesPriceRange)
      )
    }))
    .filter(category => category.products.length > 0);

  const visibleSections = activeCategory === 'all'
    ? filteredSections
    : filtersEnabled
      ? filteredSections.filter(category => category.id === activeCategory)
      : filteredSections;

  const visibleProductCount = new Set(
    visibleSections.flatMap(section => section.products.map(product => product._id || product.slug))
  ).size;

  const totalFilteredProductCount = new Set(
    filteredSections.flatMap(section => section.products.map(product => product._id || product.slug))
  ).size;

  const getCategoryCount = (categoryId) => {
    return filteredSections.find(category => category.id === categoryId)?.products.length || 0;
  };

  const handleCategoryChange = (categoryId) => {
    if (!filtersEnabled && categoryId !== 'all') {
      setFiltersEnabled(true);
    }

    setActiveCategory(categoryId);
    setHighlightedCategory(categoryId === 'all' ? '' : categoryId);

    const targetId = categoryId === 'all' ? 'all-products' : categoryId;
    setTimeout(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);

    if (categoryId !== 'all') {
      setTimeout(() => setHighlightedCategory(''), 1800);
    }
  };

  const handleFilterToggle = () => {
    setFiltersEnabled((enabled) => {
      if (enabled) {
        setActiveCategory('all');
        setHighlightedCategory('');
      }

      return !enabled;
    });
  };

  const renderProductCard = (product, isHighlighted = false) => {
    const variant = getMatchingVariant(product);
    const discount = variant.mrp > variant.price ? calculateDiscount(variant.mrp, variant.price) : 0;

    return (
      <Link
        to={`/products/${product.slug}`}
        key={`${product._id}-${product.slug}`}
        className={`product-card ${isHighlighted ? 'product-card-highlight' : ''}`}
      >
        {discount > 0 && (
          <div className="product-badge">{discount}% OFF</div>
        )}
        <div className="product-image">
          <img src={product.images?.[0]?.url || '/placeholder.jpg'} alt={product.name} />
        </div>
        <div className="product-info">
          <h3>{product.name}</h3>
          <p className="product-desc">{product.description}</p>
          <div className="product-price">
            <span className="price">&#8377;{variant.price}</span>
            {variant.mrp > variant.price && (
              <>
                <span className="mrp">&#8377;{variant.mrp}</span>
                <span className="discount-badge">{discount}% OFF</span>
              </>
            )}
          </div>
          <span className="product-card-link">View Details -&gt;</span>
        </div>
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <section className="products-banner">
        <img src="/productBanner.png" alt="Our Premium Products by Shriyash Foods" />
      </section>

      <section className="products-catalog">
        <div className="container products-layout">
          <aside className="filter-panel">
            <h2><FiFilter /> Filter By</h2>
            <div className="filter-toggle-row">
              <div>
                <strong>Enable Filters</strong>
                <small>{filtersEnabled ? 'Filters are active' : 'Showing all products'}</small>
              </div>
              <button
                type="button"
                className={`filter-switch ${filtersEnabled ? 'on' : ''}`}
                aria-pressed={filtersEnabled}
                onClick={handleFilterToggle}
              >
                <span>{filtersEnabled ? 'On' : 'Off'}</span>
              </button>
            </div>
            <div className={`filter-group ${!filtersEnabled ? 'filter-group-muted' : ''}`}>
              <h3>Categories</h3>
              <button
                type="button"
                className={`filter-option ${activeCategory === 'all' ? 'active' : ''}`}
                onClick={() => handleCategoryChange('all')}
              >
                <span>All Products</span>
                <small>({totalFilteredProductCount})</small>
              </button>
              {categorySections.map((category) => (
                <button
                  type="button"
                  className={`filter-option ${filtersEnabled && activeCategory === category.id ? 'active' : ''}`}
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  disabled={getCategoryCount(category.id) === 0}
                >
                  <span>{category.sidebarLabel}</span>
                  <small>({getCategoryCount(category.id)})</small>
                </button>
              ))}
            </div>

            <div className={`filter-group ${!filtersEnabled ? 'filter-group-muted' : ''}`}>
              <h3>Price Range</h3>
              <input
                type="range"
                className="price-range-input"
                min={PRICE_MIN}
                max={PRICE_MAX}
                step="10"
                value={priceMax}
                onChange={(event) => setPriceMax(Number(event.target.value))}
                disabled={!filtersEnabled}
              />
              <div className="price-range-labels">
                <small>&#8377;{PRICE_MIN}</small>
                <small>Up to &#8377;{priceMax}</small>
              </div>
            </div>

            <div className="filter-group">
              <h3>Sort By</h3>
              <select
                aria-label="Sort products"
                className="filter-select"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                {SORT_OPTIONS.map(option => (
                  <option value={option.value} key={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </aside>

          <div className="products-main" id="all-products">
            <div className="products-toolbar">
              <p>Showing {visibleProductCount} products</p>
              <label className="toolbar-sort">
                <span>Sort by:</span>
                <select
                  aria-label="Sort products"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                >
                  {SORT_OPTIONS.map(option => (
                    <option value={option.value} key={option.value}>{option.label}</option>
                  ))}
                </select>
                <FiChevronDown />
              </label>
            </div>

            <div className="product-categories">
              {visibleSections.map((category) => (
                <section className="product-category" id={category.id} key={category.title}>
                  <div className="category-heading">
                    <h2>{category.title}</h2>
                    {activeCategory !== category.id && (
                      <button type="button" onClick={() => handleCategoryChange(category.id)}>
                        View All -&gt;
                      </button>
                    )}
                  </div>
                  <div className="products-grid">
                    {category.products.map((product) => renderProductCard(
                      product,
                      highlightedCategory === category.id
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {visibleProductCount === 0 && (
              <div className="no-products">
                <p>No products available at the moment</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Products;
