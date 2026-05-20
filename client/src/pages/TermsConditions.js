import React from 'react';
import './PolicyPages.css';

const TermsConditions = () => {
  const terms = [
    'All products listed on the website are subject to availability.',
    'Product images are for reference purposes only; actual packaging or appearance may vary slightly.',
    'Prices and product information may change without prior notice.',
    'Orders will be confirmed only after successful payment and verification.',
    'Shriyash Foods reserves the right to cancel or refuse any order in case of incorrect pricing, suspicious activity, or product unavailability.',
    'Customers are responsible for providing accurate shipping and contact information while placing orders.',
    'Delivery timelines may vary depending on location and courier services.',
    'Unauthorized use, reproduction, or copying of website content, images, logos, or branding is strictly prohibited.',
    'All content on this website is the intellectual property of Shriyash Foods.',
    'Products should be used and consumed as per recommended guidelines.',
    'Shriyash Foods shall not be held liable for any misuse of products purchased through the website.',
    'By using this website, customers agree not to engage in any unlawful or fraudulent activities.',
    'We reserve the right to modify, update, or change these Terms & Conditions at any time without prior notice.',
  ];

  return (
    <div className="policy-page">
      <div className="container">
        <div className="policy-header">
          <h1>Terms & Conditions</h1>
        </div>

        <div className="policy-content">
          <ul>
            {terms.map((term) => (
              <li key={term}>{term}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
