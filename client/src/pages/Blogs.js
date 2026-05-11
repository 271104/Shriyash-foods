import React from 'react';
import { FiClock, FiUser } from 'react-icons/fi';
import './Blogs.css';

const Blogs = () => {
  const blogPosts = [
    {
      id: 1,
      title: "The Power of ABC Powder: Triple Nutrition in One Scoop",
      excerpt: "Discover how the combination of Amla, Beetroot, and Carrot creates a superfood powerhouse that boosts immunity, improves skin health, and supports overall wellness.",
      author: "Shriyash Foods Team",
      date: "January 15, 2025",
      readTime: "5 min read",
      image: "/abc-removebg-preview.png",
      category: "Nutrition"
    },
    {
      id: 2,
      title: "Moringa: The Miracle Tree for Modern Wellness",
      excerpt: "Learn why Moringa is called the 'miracle tree' and how incorporating Moringa powder into your daily routine can transform your health naturally.",
      author: "Shriyash Foods Team",
      date: "January 10, 2025",
      readTime: "6 min read",
      image: "/moringa-removebg-preview.png",
      category: "Superfoods"
    },
    {
      id: 3,
      title: "Beetroot Powder: Your Natural Energy Booster",
      excerpt: "Athletes and fitness enthusiasts swear by beetroot powder. Find out how this natural supplement can enhance your stamina and improve blood circulation.",
      author: "Shriyash Foods Team",
      date: "January 5, 2025",
      readTime: "4 min read",
      image: "/beetroot-removebg-preview.png",
      category: "Fitness"
    },
    {
      id: 4,
      title: "5 Creative Ways to Use Vegetable Powders in Your Kitchen",
      excerpt: "From smoothies to soups, discover innovative ways to incorporate nutrient-rich vegetable powders into your everyday meals for maximum health benefits.",
      author: "Shriyash Foods Team",
      date: "December 28, 2024",
      readTime: "7 min read",
      image: "/carrot-removebg-preview.png",
      category: "Recipes"
    },
    {
      id: 5,
      title: "Why Natural Food Powders Are Better Than Supplements",
      excerpt: "Understand the difference between synthetic supplements and natural food powders, and why choosing natural is always the better option for your health.",
      author: "Shriyash Foods Team",
      date: "December 20, 2024",
      readTime: "5 min read",
      image: "/combined-removebg-preview.png",
      category: "Health"
    },
    {
      id: 6,
      title: "The Complete Guide to Storing Health Powders",
      excerpt: "Learn the best practices for storing your health powders to maintain freshness, potency, and nutritional value for longer periods.",
      author: "Shriyash Foods Team",
      date: "December 15, 2024",
      readTime: "4 min read",
      image: "/onion-removebg-preview.png",
      category: "Tips"
    }
  ];

  return (
    <div className="blogs-page">
      {/* Hero Section */}
      <section className="blogs-hero">
        <div className="container">
          <h1>Wellness Blog</h1>
          <p>Insights, tips, and stories about natural health and nutrition</p>
        </div>
      </section>

      {/* Featured Post */}
      <section className="featured-post">
        <div className="container">
          <div className="featured-badge">Featured Article</div>
          <div className="featured-content">
            <div className="featured-image">
              <img src={blogPosts[0].image} alt={blogPosts[0].title} />
            </div>
            <div className="featured-text">
              <span className="post-category">{blogPosts[0].category}</span>
              <h2>{blogPosts[0].title}</h2>
              <p>{blogPosts[0].excerpt}</p>
              <div className="post-meta">
                <span><FiUser /> {blogPosts[0].author}</span>
                <span><FiClock /> {blogPosts[0].readTime}</span>
                <span>{blogPosts[0].date}</span>
              </div>
              <button className="btn btn-primary">Read More</button>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="blogs-grid-section">
        <div className="container">
          <h2>Latest Articles</h2>
          <div className="blogs-grid">
            {blogPosts.slice(1).map(post => (
              <article key={post.id} className="blog-card">
                <div className="blog-image">
                  <img src={post.image} alt={post.title} />
                  <span className="blog-category">{post.category}</span>
                </div>
                <div className="blog-content">
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <div className="blog-meta">
                    <span><FiClock /> {post.readTime}</span>
                    <span>{post.date}</span>
                  </div>
                  <button className="read-more-btn">Read More →</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-content">
            <h2>Stay Updated with Our Wellness Tips</h2>
            <p>Subscribe to our newsletter for the latest health insights, recipes, and exclusive offers</p>
            <form className="newsletter-form">
              <input type="email" placeholder="Enter your email address" required />
              <button type="submit" className="btn btn-primary">Subscribe</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blogs;
