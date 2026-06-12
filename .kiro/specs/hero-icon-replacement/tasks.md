# Implementation Plan

- [ ] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Emoji Icons Render Inconsistently
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate emojis are being used instead of SVG icons
  - **Scoped PBT Approach**: Scope the property to concrete failing cases - the 8 emoji icon locations in hero value props and trust badges
  - Test that all icon containers with className "value-icon" or "trust-icon" contain emoji characters (🤝, 🌾, 🌍, ✨, 🍃, 🌱) rather than `<img>` elements
  - Test implementation details from Bug Condition in design: `isBugCondition(iconElement)` returns true for all 8 icon locations
  - The test assertions should match the Expected Behavior Properties from design: expect SVG `<img>` elements with alt text
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves emojis are currently used)
  - Document counterexamples found: which specific locations contain emojis, what emojis are used
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Layout and Functionality Remain Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-icon elements:
    - Hero section layout (spacing, alignment, positioning of value prop cards)
    - Trust badges layout (horizontal row with consistent spacing)
    - Hero button navigation ("Explore Products" and "Our Journey" routes)
    - Text content in value propositions and trust badges
    - Responsive design behavior at mobile/tablet/desktop breakpoints
    - Intersection observer animations for scrolling elements
    - Category carousel and bestseller carousel functionality
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Property-based testing generates many test cases for stronger guarantees:
    - Generate random viewport widths and verify layout adapts identically
    - Generate random user interactions (scrolling, clicking, resizing) and verify no layout shifts
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 3. Fix for emoji icon inconsistency

  - [ ] 3.1 Create SVG icon assets in public/icons directory
    - Create `/icons/` directory if it doesn't exist
    - Create 8 SVG icon files with green color scheme (#2d5016, #4a7c2c):
      - `community-farmers.svg` - Handshake or group of people with farm elements (48x48px)
      - `growth-plant.svg` - Upward arrow with plant or leaf motif (48x48px)
      - `globe-leaf.svg` - Globe with leaf overlay or wrapped in leaves (48x48px)
      - `sparkle-badge.svg` - Badge or star with sparkle effect (48x48px)
      - `leaf.svg` - Single stylized leaf in green (48x48px)
      - `farmer-support.svg` - Farmer figure or handshake with farm elements, distinct from community icon (48x48px)
      - `hygiene-shield.svg` - Shield with checkmark or hygiene symbol (48x48px)
      - `sustainable-plant.svg` - Seedling or plant in circular sustainability motif (48x48px)
    - Ensure each SVG is optimized for web (< 5KB each), clean line work, scalable
    - _Bug_Condition: isBugCondition(iconElement) where iconElement contains emoji characters_
    - _Expected_Behavior: SVG files exist and load successfully with HTTP 200 status_
    - _Preservation: No existing files modified, only new files added_
    - _Requirements: 2.1, 2.2, 2.4_

  - [ ] 3.2 Replace hero value proposition emoji icons with SVG images
    - Open `client/src/pages/Home.js`
    - Locate hero value propositions section (lines ~115-147)
    - Replace emoji icons with SVG img elements:
      - Change `<div className="value-icon">🤝</div>` to `<div className="value-icon"><img src="/icons/community-farmers.svg" alt="Community and Farmers" /></div>`
      - Change `<div className="value-icon">🌾</div>` to `<div className="value-icon"><img src="/icons/growth-plant.svg" alt="Growth and Quality" /></div>`
      - Change `<div className="value-icon">🌍</div>` to `<div className="value-icon"><img src="/icons/globe-leaf.svg" alt="Global Sustainability" /></div>`
      - Change `<div className="value-icon">✨</div>` to `<div className="value-icon"><img src="/icons/sparkle-badge.svg" alt="Quality and Innovation" /></div>`
    - _Bug_Condition: isBugCondition(iconElement) for hero value prop icons_
    - _Expected_Behavior: Each .value-icon contains <img> with src matching /\/icons\/.*\.svg$/ and non-empty alt text_
    - _Preservation: All text content, layout, and className attributes remain unchanged_
    - _Requirements: 2.1, 2.3, 2.4, 2.5_

  - [ ] 3.3 Replace trust badge emoji icons with SVG images
    - In `client/src/pages/Home.js`
    - Locate trust badges section (lines ~162-186)
    - Replace emoji icons with SVG img elements:
      - Change `<div className="trust-icon">🍃</div>` to `<div className="trust-icon"><img src="/icons/leaf.svg" alt="Natural ingredients" /></div>`
      - Change `<div className="trust-icon">🤝</div>` to `<div className="trust-icon"><img src="/icons/farmer-support.svg" alt="Supporting Farmers" /></div>`
      - Change `<div className="trust-icon">✨</div>` to `<div className="trust-icon"><img src="/icons/hygiene-shield.svg" alt="Hygienically Processed" /></div>`
      - Change `<div className="trust-icon">🌱</div>` to `<div className="trust-icon"><img src="/icons/sustainable-plant.svg" alt="Sustainable Food Vision" /></div>`
    - _Bug_Condition: isBugCondition(iconElement) for trust badge icons_
    - _Expected_Behavior: Each .trust-icon contains <img> with src matching /\/icons\/.*\.svg$/ and non-empty alt text_
    - _Preservation: All text content, layout, and className attributes remain unchanged_
    - _Requirements: 2.2, 2.3, 2.4, 2.5_

  - [ ] 3.4 Add CSS styling for SVG icons (if needed)
    - Open `client/src/pages/Home.css`
    - Check if existing CSS for `.value-icon` and `.trust-icon` handles img elements correctly
    - If needed, add CSS rules to ensure consistent sizing:
      ```css
      .value-icon img,
      .trust-icon img {
        width: 3rem;
        height: 3rem;
        object-fit: contain;
        display: block;
      }
      ```
    - Verify font-size properties don't conflict with image sizing
    - _Bug_Condition: Icon containers may have been styled for text content_
    - _Expected_Behavior: SVG icons render at consistent size across all platforms_
    - _Preservation: All other CSS rules and page styling remain unchanged_
    - _Requirements: 2.4, 2.5_

  - [ ] 3.5 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - SVG Icons Render Consistently
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms emojis replaced with SVG icons)
    - Verify all 8 icon locations now contain `<img>` elements with valid SVG src and alt text
    - Verify no emoji characters remain in rendered output
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ] 3.6 Verify preservation tests still pass
    - **Property 2: Preservation** - Layout and Functionality Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Verify hero section layout, spacing, alignment unchanged
    - Verify trust badges layout and spacing unchanged
    - Verify hero buttons navigate correctly
    - Verify responsive design behavior unchanged
    - Verify animations and carousels function identically
    - Confirm all tests still pass after fix (no regressions)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 4. Checkpoint - Ensure all tests pass
  - Run full test suite and verify all tests pass
  - Manually test page rendering in multiple browsers (Chrome, Firefox, Safari, Edge)
  - Test on different operating systems if possible (Windows, macOS)
  - Run accessibility audit (Lighthouse or axe DevTools) to verify alt text compliance
  - Verify SVG icons load correctly (check Network tab for HTTP 200 status)
  - Test responsive design at mobile, tablet, and desktop breakpoints
  - Ensure all tests pass, ask the user if questions arise
