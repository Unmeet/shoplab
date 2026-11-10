/* ShopLab practice API service worker. Built 2026-11-10T14:31:53.970Z. Keep this file next to index.html. */
var ShopLabCore = (function () {
  'use strict';

  const PASSWORD = 'Practice@123';
  const TAX_RATE = 0.08;
  const DEFAULT_TTL = 3600;

  const CATEGORIES = [
    { id: 'electronics', name: 'Electronics' },
    { id: 'fashion', name: 'Fashion' },
    { id: 'home', name: 'Home & Kitchen' },
    { id: 'books', name: 'Books' },
    { id: 'sports', name: 'Sports & Outdoors' },
    { id: 'beauty', name: 'Beauty' }
  ];

  const SHIPPING = {
    standard: { id: 'standard', label: 'Standard', eta: '5–7 business days', price: 5.99, freeOver: 75 },
    express: { id: 'express', label: 'Express', eta: '2–3 business days', price: 14.99 },
    overnight: { id: 'overnight', label: 'Overnight', eta: 'Next business day', price: 29.99 }
  };

  const COUPONS = {
    SAVE10: { code: 'SAVE10', type: 'percent', value: 10, description: '10% off your order' },
    FLAT20: { code: 'FLAT20', type: 'flat', value: 20, minSubtotal: 100, description: '$20 off orders of $100 or more' },
    FREESHIP: { code: 'FREESHIP', type: 'shipping', value: 0, description: 'Free shipping on any method' },
    EXPIRED5: { code: 'EXPIRED5', type: 'percent', value: 5, expired: true, description: '5% off, already expired (for negative tests)' }
  };

  // name, category, price, rating, stock, emoji, hue, description, colors, sizes, ratingsCount
  const P = [
    ['Aurora Wireless Headphones', 'electronics', 129.99, 4.6, 34, '🎧', 225, 'Over-ear headphones with active noise cancelling and a 30-hour battery.', ['Black', 'Silver', 'Navy'], [], 412],
    ['Pulse Smartwatch S2', 'electronics', 199.0, 4.3, 12, '⌚', 200, 'Heart-rate, sleep and GPS tracking with a 7-day battery and swim-proof case.', ['Graphite', 'Rose'], ['40 mm', '44 mm'], 268],
    ['Nova Bluetooth Speaker', 'electronics', 59.5, 4.1, 0, '🔊', 185, 'Pocket speaker with deep bass and 12 hours of playback. Currently sold out.', ['Teal', 'Black'], [], 97],
    ['Lumen 4K Webcam', 'electronics', 89.99, 3.9, 21, '📷', 240, 'Ultra-sharp webcam with auto light correction and a privacy shutter.', [], [], 143],
    ['Everyday Cotton Tee', 'fashion', 19.99, 4.4, 120, '👕', 345, 'Soft organic cotton tee with a relaxed fit that holds its shape.', ['White', 'Black', 'Sage'], ['S', 'M', 'L', 'XL'], 980],
    ['Trail Runner Sneakers', 'fashion', 84.0, 4.5, 40, '👟', 15, 'Lightweight trail shoes with a grippy outsole and breathable mesh.', ['Orange', 'Grey'], ['7', '8', '9', '10', '11'], 521],
    ['Classic Denim Jacket', 'fashion', 74.5, 4.2, 18, '🧥', 215, 'Mid-wash denim jacket with brass buttons and two chest pockets.', ['Mid wash', 'Dark wash'], ['S', 'M', 'L'], 188],
    ['Canvas Backpack', 'fashion', 49.0, 4.7, 55, '🎒', 35, 'Water-resistant canvas backpack with a padded 15-inch laptop sleeve.', ['Olive', 'Sand'], [], 356],
    ['Ceramic Pour-Over Set', 'home', 38.0, 4.8, 25, '☕', 28, 'Hand-glazed dripper and 600 ml carafe for slow morning coffee.', ['Cream', 'Charcoal'], [], 233],
    ['Linen Throw Pillow', 'home', 24.99, 4.0, 60, '🛋️', 48, 'Stonewashed linen cover with a feather-blend insert.', ['Clay', 'Oat', 'Moss'], [], 76],
    ['Smart LED Bulb (2-pack)', 'home', 29.99, 3.8, 80, '💡', 52, 'App-controlled bulbs with 16 million colours and schedules.', [], [], 310],
    ['Cast Iron Skillet 10"', 'home', 42.0, 4.9, 15, '🍳', 10, 'Pre-seasoned skillet that goes from stovetop to oven.', [], [], 645],
    ['The Pragmatic Tester', 'books', 34.99, 4.7, 30, '📘', 220, 'A field guide to building test suites that people trust and keep.', [], ['Paperback', 'Hardcover'], 204],
    ['Patterns of Automation', 'books', 41.0, 4.5, 22, '📗', 140, 'Page objects, screenplay, fixtures and when each one earns its keep.', [], ['Paperback', 'Hardcover'], 119],
    ['APIs Explained', 'books', 27.5, 4.2, 0, '📙', 32, 'HTTP, REST and contract testing from first principles. Out of stock.', [], ['Paperback'], 88],
    ['Clean Selectors', 'books', 22.0, 4.6, 45, '📕', 0, 'Write locators that survive redesigns. Short, practical, opinionated.', [], ['Paperback', 'eBook'], 152],
    ['Yoga Mat Pro', 'sports', 45.0, 4.4, 33, '🧘', 280, '6 mm non-slip mat with alignment lines and a carry strap.', ['Plum', 'Ocean'], [], 290],
    ['Adjustable Dumbbells', 'sports', 149.99, 4.6, 8, '🏋️', 205, 'Dial from 2.5 to 24 kg in seconds. Sold as a pair.', [], [], 174],
    ['Insulated Water Bottle', 'sports', 24.0, 4.5, 150, '🥤', 180, 'Keeps drinks cold for 24 hours and hot for 12.', ['Glacier', 'Coral', 'Black'], ['500 ml', '750 ml'], 802],
    ['Road Bike Helmet', 'sports', 69.99, 4.3, 3, '🚴', 100, 'Ventilated helmet with MIPS protection and a rear light clip.', ['White', 'Matte black'], ['M', 'L'], 61],
    ['Hydrating Face Serum', 'beauty', 32.0, 4.1, 70, '🧴', 300, 'Hyaluronic serum for all skin types, fragrance free.', [], ['30 ml', '50 ml'], 377],
    ['Bamboo Toothbrush Set', 'beauty', 9.99, 4.0, 200, '🪥', 120, 'Four compostable toothbrushes with soft charcoal bristles.', [], [], 455],
    ['Herbal Shampoo', 'beauty', 14.5, 3.7, 90, '🫧', 165, 'Sulfate-free shampoo with rosemary and mint.', [], ['250 ml', '500 ml'], 129],
    ['Mineral Sunscreen SPF 50', 'beauty', 18.75, 4.6, 65, '🌞', 45, 'Reef-safe mineral sunscreen that leaves no white cast.', [], [], 298]
  ];

  const TEST_USERS = [
    { id: 1, username: 'standard_user', email: 'standard@shoplab.test', firstName: 'Sam', lastName: 'Standard', role: 'customer', status: 'active', phone: '+1 555 010 1001', behaviour: 'Normal customer. Use this for happy paths.' },
    { id: 2, username: 'locked_user', email: 'locked@shoplab.test', firstName: 'Lee', lastName: 'Locked', role: 'customer', status: 'locked', phone: '+1 555 010 1002', behaviour: 'Login is refused with HTTP 423.' },
    { id: 3, username: 'slow_user', email: 'slow@shoplab.test', firstName: 'Sky', lastName: 'Slow', role: 'customer', status: 'active', phone: '+1 555 010 1003', behaviour: 'Login takes 3 seconds. Practise waits.' },
    { id: 4, username: 'error_user', email: 'error@shoplab.test', firstName: 'Eli', lastName: 'Error', role: 'customer', status: 'active', phone: '+1 555 010 1004', behaviour: 'Placing an order always fails with HTTP 500.' },
    { id: 5, username: 'admin', email: 'admin@shoplab.test', firstName: 'Ada', lastName: 'Admin', role: 'admin', status: 'active', phone: '+1 555 010 1005', behaviour: 'Admin. Manages products, users and order statuses.' },
    { id: 6, username: 'otp_user', email: 'otp@shoplab.test', firstName: 'Olu', lastName: 'Otp', role: 'customer', status: 'active', phone: '+1 555 010 1006', mfa: true, behaviour: 'Login needs a 6-digit code sent to the ShopLab inbox.' },
    { id: 7, username: 'returning_user', email: 'returning@shoplab.test', firstName: 'Rae', lastName: 'Returning', role: 'customer', status: 'active', phone: '+91 98765 43210', behaviour: 'Has saved addresses, a wishlist and past orders, including one you can return.' }
  ];

  const GROUPS = ['Auth', 'Products', 'Cart', 'Wishlist', 'Addresses', 'Checkout', 'Orders', 'Inbox', 'Users', 'Utilities'];
  const SALE = { 1: 149.99, 6: 99.0, 9: 45.0, 12: 52.0, 17: 55.0, 19: 30.0, 21: 40.0 };
  const GIFT_WRAP = 2.99, COD_FEE = 1.99, COD_LIMIT = 200;
  const BANKS = ['Axis Bank', 'HDFC Bank', 'ICICI Bank', 'Kotak Mahindra Bank', 'State Bank of India', 'Yes Bank'];
  const SLOTS = { morning: '08:00–12:00', afternoon: '12:00–16:00', evening: '16:00–20:00' };
  const RETURN_REASONS = { damaged: 'Arrived damaged', 'wrong-item': 'Wrong item sent', 'not-as-described': 'Not as described', 'changed-mind': 'Changed my mind', other: 'Other' };

  const ENDPOINTS = [
    { group: 'Utilities', method: 'GET', path: '/api/health', auth: 'none', desc: 'Service health and mode.' },
    { group: 'Utilities', method: 'POST', path: '/api/reset', auth: 'none', desc: 'Reset all data to the original seed. Login sessions survive.' },
    { group: 'Auth', method: 'POST', path: '/api/auth/register', auth: 'none', desc: 'Create an account and get a token.', body: { username: 'new_tester', email: 'new@shoplab.test', password: 'Practice@123', firstName: 'New', lastName: 'Tester' } },
    { group: 'Auth', method: 'POST', path: '/api/auth/login', auth: 'none', desc: 'Log in. Optional expiresIn (10–86400 seconds) to test token expiry.', body: { username: 'standard_user', password: 'Practice@123' } },
    { group: 'Auth', method: 'GET', path: '/api/auth/me', auth: 'user', desc: 'The logged-in user and session.' },
    { group: 'Auth', method: 'PATCH', path: '/api/auth/me', auth: 'user', desc: 'Update your profile.', body: { firstName: 'Samuel', phone: '+1 555 010 9999' } },
    { group: 'Auth', method: 'POST', path: '/api/auth/logout', auth: 'user', desc: 'Invalidate the current token.' },
    { group: 'Auth', method: 'POST', path: '/api/auth/verify-otp', auth: 'none', desc: 'Second login step for otp_user: send the mfaToken from login and the code from the inbox.', body: { mfaToken: 'mfa_paste_from_login', code: '123456' } },
    { group: 'Auth', method: 'POST', path: '/api/auth/resend-otp', auth: 'none', desc: 'New sign-in code. Allowed once every 30 seconds.', body: { mfaToken: 'mfa_paste_from_login' } },
    { group: 'Auth', method: 'POST', path: '/api/auth/email-code', auth: 'none', desc: 'Passwordless login: emails a 6-digit code. Finish with verify-otp.', body: { email: 'standard@shoplab.test' } },
    { group: 'Auth', method: 'POST', path: '/api/auth/oauth', auth: 'none', desc: 'ShopLab ID sign-in after the consent window. Needs consent: true.', body: { provider: 'shoplab-id', username: 'standard_user', consent: true } },
    { group: 'Auth', method: 'POST', path: '/api/auth/forgot-password', auth: 'none', desc: 'Emails a 6-digit reset code. Always 200, so it never reveals which emails exist.', body: { email: 'standard@shoplab.test' } },
    { group: 'Auth', method: 'POST', path: '/api/auth/reset-password', auth: 'none', desc: 'Set a new password with the emailed code. Logs out every session.', body: { email: 'standard@shoplab.test', code: '123456', newPassword: 'NewPass@123' } },
    { group: 'Auth', method: 'POST', path: '/api/auth/change-password', auth: 'user', desc: 'Change password while logged in.', body: { currentPassword: 'Practice@123', newPassword: 'NewPass@123' } },
    { group: 'Products', method: 'GET', path: '/api/products', sample: '/api/products?category=electronics&sort=price_asc&page=1&limit=5', auth: 'none', desc: 'List with search, category, minPrice, maxPrice, minRating, inStock, onSale, sort, page, limit. Sends X-Total-Count, Link and ETag headers.' },
    { group: 'Products', method: 'GET', path: '/api/products/:id', sample: '/api/products/1', auth: 'none', desc: 'Product details. Send If-None-Match with the ETag to get 304 Not Modified.' },
    { group: 'Products', method: 'POST', path: '/api/products', auth: 'admin', desc: 'Create a product.', body: { name: 'Test Product', category: 'electronics', price: 9.99, stock: 10, description: 'Created by an API test.' } },
    { group: 'Products', method: 'PUT', path: '/api/products/:id', sample: '/api/products/1', auth: 'admin', desc: 'Replace a product (all fields).', body: { name: 'Aurora Wireless Headphones', category: 'electronics', price: 119.99, stock: 30, description: 'Updated by PUT.' } },
    { group: 'Products', method: 'PATCH', path: '/api/products/:id', sample: '/api/products/1', auth: 'admin', desc: 'Update some fields.', body: { price: 99.99 } },
    { group: 'Products', method: 'DELETE', path: '/api/products/:id', sample: '/api/products/24', auth: 'admin', desc: 'Delete a product. Returns 204.' },
    { group: 'Products', method: 'GET', path: '/api/categories', auth: 'none', desc: 'Categories with product counts.' },
    { group: 'Products', method: 'POST', path: '/api/products/:id/notify', sample: '/api/products/3/notify', auth: 'none', desc: 'Back-in-stock alert for a sold-out product. Emails when stock returns.', body: { email: 'standard@shoplab.test' } },
    { group: 'Products', method: 'GET', path: '/api/products/:id/reviews', sample: '/api/products/1/reviews', auth: 'none', desc: 'Written reviews for a product.' },
    { group: 'Products', method: 'POST', path: '/api/products/:id/reviews', sample: '/api/products/2/reviews', auth: 'user', desc: 'Add a review (one per user per product).', body: { rating: 5, comment: 'Works exactly as described.' } },
    { group: 'Cart', method: 'GET', path: '/api/cart', auth: 'user', desc: 'Your cart with totals.' },
    { group: 'Cart', method: 'POST', path: '/api/cart/items', auth: 'user', desc: 'Add an item (quantity 1–10). Optional options: color, size, giftWrap (+$2.99), giftMessage, protection (1y or 2y, electronics only).', body: { productId: 1, quantity: 1, options: { color: 'Black', giftWrap: true, giftMessage: 'Happy birthday!', protection: '1y' } } },
    { group: 'Cart', method: 'PATCH', path: '/api/cart/items/:productId', sample: '/api/cart/items/1', auth: 'user', desc: 'Change quantity. 0 removes the item.', body: { quantity: 3 } },
    { group: 'Cart', method: 'DELETE', path: '/api/cart/items/:productId', sample: '/api/cart/items/1', auth: 'user', desc: 'Remove an item.' },
    { group: 'Cart', method: 'DELETE', path: '/api/cart', auth: 'user', desc: 'Empty the cart.' },
    { group: 'Cart', method: 'POST', path: '/api/cart/coupon', auth: 'user', desc: 'Apply a coupon: SAVE10, FLAT20, FREESHIP, EXPIRED5.', body: { code: 'SAVE10' } },
    { group: 'Cart', method: 'DELETE', path: '/api/cart/coupon', auth: 'user', desc: 'Remove the coupon.' },
    { group: 'Cart', method: 'PUT', path: '/api/cart/shipping', auth: 'user', desc: 'Choose standard, express or overnight.', body: { method: 'express' } },
    { group: 'Cart', method: 'GET', path: '/api/coupons', auth: 'none', desc: 'Public coupon list.' },
    { group: 'Cart', method: 'GET', path: '/api/shipping-methods', auth: 'none', desc: 'Shipping options and prices.' },
    { group: 'Cart', method: 'GET', path: '/api/delivery', sample: '/api/delivery?zip=560001&productId=1', auth: 'none', desc: 'Delivery dates and cash-on-delivery availability for a postal code. Codes ending in 9 are remote; 000000 and codes starting 99 are not served.' },
    { group: 'Wishlist', method: 'GET', path: '/api/wishlist', auth: 'user', desc: 'Saved products.' },
    { group: 'Wishlist', method: 'POST', path: '/api/wishlist', auth: 'user', desc: 'Save a product.', body: { productId: 5 } },
    { group: 'Wishlist', method: 'DELETE', path: '/api/wishlist/:productId', sample: '/api/wishlist/5', auth: 'user', desc: 'Remove a saved product. Returns 204.' },
    { group: 'Addresses', method: 'GET', path: '/api/addresses', auth: 'user', desc: 'Your saved addresses.' },
    { group: 'Addresses', method: 'POST', path: '/api/addresses', auth: 'user', desc: 'Save an address (up to 5). The first one becomes the default.', body: { label: 'Home', fullName: 'Sam Standard', phone: '+1 555 010 1001', line1: '12 Test Street', city: 'Austin', state: 'TX', zip: '73301', country: 'US' } },
    { group: 'Addresses', method: 'PUT', path: '/api/addresses/:id', sample: '/api/addresses/1', auth: 'user', desc: 'Replace a saved address.', body: { label: 'Home', fullName: 'Rae Returning', phone: '+91 98765 43210', line1: '221 Lake View Road', city: 'Bengaluru', state: 'KA', zip: '560001', country: 'IN' } },
    { group: 'Addresses', method: 'POST', path: '/api/addresses/:id/default', sample: '/api/addresses/2/default', auth: 'user', desc: 'Make an address the default.' },
    { group: 'Addresses', method: 'DELETE', path: '/api/addresses/:id', sample: '/api/addresses/2', auth: 'user', desc: 'Delete an address. Returns 204.' },
    { group: 'Checkout', method: 'GET', path: '/api/checkout/summary', sample: '/api/checkout/summary?paymentMethod=cod&zip=560001', auth: 'user', desc: 'Order summary for checkout: items, discount, shipping, tax, payment fee, total, cash-on-delivery availability and estimated delivery.' },
    { group: 'Checkout', method: 'POST', path: '/api/orders', auth: 'user', desc: 'Place an order. payment.method: card (4111… passes, 4000…0002 declines, 4000…3220 needs threeDSCode 123456), upi (fail@upi declines), netbanking, or cod (orders up to $200, +$1.99). Optional billingAddress, scheduledDelivery, deliveryInstructions, orderNotes.', body: { shippingAddress: { fullName: 'Sam Standard', phone: '+1 555 010 1001', line1: '12 Test Street', city: 'Austin', state: 'TX', zip: '73301', country: 'US' }, payment: { cardName: 'Sam Standard', cardNumber: '4111 1111 1111 1111', expiry: '12/30', cvv: '123' } } },
    { group: 'Orders', method: 'GET', path: '/api/orders', sample: '/api/orders?status=placed&sort=newest', auth: 'user', desc: 'Your orders. Filter by status, sort by newest, oldest or total_desc.' },
    { group: 'Orders', method: 'GET', path: '/api/orders/:id', sample: '/api/orders/1001', auth: 'user', desc: 'One order. Status moves from placed to delivered over 10 minutes.' },
    { group: 'Orders', method: 'POST', path: '/api/orders/:id/cancel', sample: '/api/orders/1002/cancel', auth: 'user', desc: 'Cancel an order before it ships.' },
    { group: 'Orders', method: 'POST', path: '/api/orders/:id/return', sample: '/api/orders/1001/return', auth: 'user', desc: 'Return a delivered order. Reasons: damaged, wrong-item, not-as-described, changed-mind, other (needs a comment).', body: { reason: 'damaged', comment: 'Handle was cracked.' } },
    { group: 'Orders', method: 'POST', path: '/api/orders/:id/reorder', sample: '/api/orders/1001/reorder', auth: 'user', desc: 'Buy again: adds available items to the cart and reports skipped ones.' },
    { group: 'Orders', method: 'POST', path: '/api/orders/track', auth: 'none', desc: 'Public order tracking by order number and email.', body: { orderId: 1001, email: 'returning@shoplab.test' } },
    { group: 'Orders', method: 'PATCH', path: '/api/orders/:id/status', sample: '/api/orders/1002/status', auth: 'admin', desc: 'Admin: set placed, processing, shipped, delivered, or refunded (after a return).', body: { status: 'delivered' } },
    { group: 'Inbox', method: 'GET', path: '/api/inbox', sample: '/api/inbox?email=standard@shoplab.test', auth: 'none', desc: 'Test mailbox for any address: confirmations, codes and alerts.' },
    { group: 'Inbox', method: 'GET', path: '/api/inbox/:id', sample: '/api/inbox/1', auth: 'none', desc: 'One email with its full body. Marks it as read.' },
    { group: 'Inbox', method: 'DELETE', path: '/api/inbox', sample: '/api/inbox?email=standard@shoplab.test', auth: 'none', desc: 'Delete every email for an address. Returns 204.' },
    { group: 'Users', method: 'GET', path: '/api/users', auth: 'admin', desc: 'All users (admin only).' },
    { group: 'Users', method: 'GET', path: '/api/users/:id', sample: '/api/users/1', auth: 'admin', desc: 'One user (admin only).' },
    { group: 'Utilities', method: 'GET', path: '/api/delay/:seconds', sample: '/api/delay/2', auth: 'none', desc: 'Responds after 0–10 seconds. Practise timeouts.' },
    { group: 'Utilities', method: 'GET', path: '/api/status/:code', sample: '/api/status/418', auth: 'none', desc: 'Responds with any status code 200–599.' },
    { group: 'Utilities', method: 'GET', path: '/api/flaky', auth: 'none', desc: 'Fails with 503 about half the time. Practise retries.' },
    { group: 'Utilities', method: 'GET', path: '/api/limited', auth: 'none', desc: '5 requests per minute per client, then 429 with Retry-After.' },
    { group: 'Utilities', method: 'POST', path: '/api/echo', auth: 'none', desc: 'Echoes your method, headers, query and body. Works with every method.', body: { hello: 'world' } },
    { group: 'Utilities', method: 'GET', path: '/api/config', auth: 'none', desc: 'Chaos settings: added latency and random failure rate.' },
    { group: 'Utilities', method: 'PUT', path: '/api/config', auth: 'none', desc: 'Add 0–5000 ms latency and a 0–50% random 503 rate to every other endpoint.', body: { latencyMs: 800, failureRate: 20 } },
    { group: 'Utilities', method: 'POST', path: '/api/newsletter', auth: 'none', desc: 'Subscribe an email. A welcome email with a coupon arrives in the inbox.', body: { email: 'standard@shoplab.test' } },
    { group: 'Utilities', method: 'POST', path: '/api/upload', auth: 'none', desc: 'Accepts any body and reports its size and content type.' },
    { group: 'Utilities', method: 'GET', path: '/api/files/sample.csv', auth: 'none', desc: 'A CSV file download (Content-Disposition: attachment).' }
  ];

  function round(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function rid(n) { const c = 'abcdefghijklmnopqrstuvwxyz0123456789'; let s = ''; for (let i = 0; i < n; i++) s += c[Math.floor(Math.random() * c.length)]; return s; }
  function isInt(v) { return typeof v === 'number' && Number.isInteger(v); }
  function str(v) { return typeof v === 'string' ? v.trim() : ''; }
  function code6() { return String(100000 + Math.floor(Math.random() * 900000)); }
  function maskEmail(e) { return String(e).replace(/^(.)(.*)(@.*)$/, (m, a, b, c) => a + '*'.repeat(Math.max(3, b.length)) + c); }
  function pwOk(pw) { return typeof pw === 'string' && pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /\d/.test(pw) && /[^A-Za-z0-9]/.test(pw); }
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function luhn(num) {
    let sum = 0, alt = false;
    for (let i = num.length - 1; i >= 0; i--) { let d = +num[i]; if (alt) { d *= 2; if (d > 9) d -= 9; } sum += d; alt = !alt; }
    return sum % 10 === 0;
  }

  function seed() {
    const products = P.map((p, i) => ({
      id: i + 1, sku: 'SL-' + (1001 + i), name: p[0], category: p[1], price: p[2], rating: p[3], ratingsCount: p[10],
      stock: p[4], emoji: p[5], hue: p[6], description: p[7], colors: p[8], sizes: p[9], compareAtPrice: SALE[i + 1] || null,
      createdAt: new Date(Date.UTC(2026, 0, 1 + i, 9)).toISOString()
    }));
    const users = TEST_USERS.map(u => Object.assign({}, u, { password: PASSWORD, createdAt: '2026-01-05T09:00:00.000Z' }));
    delete users[0].behaviour;
    users.forEach(u => delete u.behaviour);
    const reviews = [
      { id: 1, productId: 1, userId: 1, author: 'Sam S.', rating: 5, comment: 'Noise cancelling is excellent on flights.', createdAt: '2026-03-02T10:00:00.000Z' },
      { id: 2, productId: 1, userId: 3, author: 'Sky S.', rating: 4, comment: 'Great sound, case is a little bulky.', createdAt: '2026-03-12T10:00:00.000Z' },
      { id: 3, productId: 6, userId: 1, author: 'Sam S.', rating: 5, comment: 'Light and grippy on muddy trails.', createdAt: '2026-04-08T10:00:00.000Z' },
      { id: 4, productId: 9, userId: 4, author: 'Eli E.', rating: 5, comment: 'Makes a very clean cup.', createdAt: '2026-04-20T10:00:00.000Z' },
      { id: 5, productId: 13, userId: 5, author: 'Ada A.', rating: 4, comment: 'Every QA lead should read chapter 3.', createdAt: '2026-05-01T10:00:00.000Z' },
      { id: 6, productId: 11, userId: 3, author: 'Sky S.', rating: 3, comment: 'App pairing took a few tries.', createdAt: '2026-05-15T10:00:00.000Z' }
    ];
    const day = 86400000, now = Date.now();
    const home = { id: 1, label: 'Home', fullName: 'Rae Returning', phone: '+91 98765 43210', line1: '221 Lake View Road', line2: 'Flat 4B', city: 'Bengaluru', state: 'KA', zip: '560001', country: 'IN', isDefault: true };
    const office = { id: 2, label: 'Office', fullName: 'Rae Returning', phone: '+1 555 010 1007', line1: '500 Commerce Ave', line2: 'Suite 300', city: 'Austin', state: 'TX', zip: '78701', country: 'US', isDefault: false };
    function mkOrder(id, lines, ago, extra) {
      const items = lines.map(([pid, q]) => { const p = products[pid - 1]; return { productId: pid, name: p.name, sku: p.sku, emoji: p.emoji, hue: p.hue, price: p.price, extrasPerUnit: 0, unitPrice: p.price, options: null, quantity: q, stock: p.stock, lineTotal: round(p.price * q) }; });
      const subtotal = round(items.reduce((s, i) => s + i.lineTotal, 0));
      const shipping = subtotal >= 75 ? 0 : 5.99, tax = round(subtotal * TAX_RATE);
      const addr = Object.assign({ email: 'returning@shoplab.test' }, home); delete addr.id; delete addr.label; delete addr.isDefault;
      return Object.assign({ id, userId: 7, items, subtotal, discount: 0, shipping, tax, total: round(subtotal + shipping + tax), coupon: null, shippingMethod: 'standard', shippingAddress: addr, paymentFee: 0, payment: { method: 'card', brand: 'Visa', last4: '1111', label: 'Visa ending 1111' }, createdAt: new Date(now - ago).toISOString(), cancelledAt: null, notified: { shipped: true, delivered: true } }, extra || {});
    }
    const orders = [
      mkOrder(1001, [[12, 1], [9, 1], [15, 1]], 3 * day),
      mkOrder(1002, [[5, 2], [19, 1]], 3600000, { statusOverride: 'processing', notified: {} }),
      mkOrder(1003, [[8, 1]], 10 * day, { cancelledAt: new Date(now - 10 * day + 3600000).toISOString() })
    ];
    const mail = (id, to, subject, body, kind, ago) => ({ id, from: 'ShopLab <no-reply@shoplab.test>', to, subject, body, kind, read: false, createdAt: new Date(now - ago).toISOString(), meta: {} });
    const emails = [
      mail(1, 'standard@shoplab.test', 'Welcome to ShopLab, Sam', 'Hi Sam,\n\nYour ShopLab account is ready. Happy testing!\n\nShopLab', 'welcome', 20 * day),
      mail(2, 'returning@shoplab.test', 'Welcome to ShopLab, Rae', 'Hi Rae,\n\nYour ShopLab account is ready. Happy testing!\n\nShopLab', 'welcome', 30 * day),
      mail(3, 'returning@shoplab.test', 'Order #1001 has been delivered', 'Hi Rae,\n\nOrder #1001 was delivered. Something wrong? You can request a return from the order page within 30 days.\n\nShopLab', 'order_delivered', 2 * day)
    ];
    return {
      version: 2, users, products, reviews, carts: {}, wishlists: { 7: [2, 3] }, orders, sessions: {},
      addresses: { 7: [home, office] }, emails, notify: [], resetCodes: {}, mfa: {}, loginFails: {}, newsletter: [],
      config: { latencyMs: 0, failureRate: 0 },
      seq: { product: products.length + 1, user: users.length + 1, order: 1004, review: reviews.length + 1, address: 3, email: emails.length + 1 }
    };
  }

  function createBackend(opts) {
    opts = opts || {};
    const started = Date.now();
    let db = null;
    try { db = opts.load ? opts.load() : null; } catch (e) { db = null; }
    if (!db || db.version !== 2) db = seed();
    const hits = {};

    function save() { if (opts.save) { try { opts.save(db); } catch (e) { /* storage full or blocked */ } } }
    function ok(status, body, headers) { return { status, body, headers: headers || {} }; }
    function err(status, code, message, details) {
      const e = { code, message };
      if (details && details.length) e.details = details;
      return { status, body: { error: e }, headers: {} };
    }
    function publicUser(u) { const c = clone(u); delete c.password; return c; }
    function sendEmail(to, subject, body, kind, meta) {
      const m = { id: db.seq.email++, from: 'ShopLab <no-reply@shoplab.test>', to: String(to).toLowerCase(), subject, body, kind, read: false, createdAt: new Date().toISOString(), meta: meta || {} };
      db.emails.push(m);
      if (db.emails.length > 400) db.emails.splice(0, db.emails.length - 400);
      return m;
    }
    function cleanOptions(o, p) {
      if (o === undefined || o === null) return { value: undefined };
      if (typeof o !== 'object' || Array.isArray(o)) return { details: [{ field: 'options', message: 'options must be an object.' }] };
      const d = [], v = {};
      if (o.color !== undefined) { if (!p.colors.includes(o.color)) d.push({ field: 'options.color', message: p.colors.length ? 'Colour must be one of: ' + p.colors.join(', ') + '.' : 'This product has one colour.' }); else v.color = o.color; }
      if (o.size !== undefined) { if (!p.sizes.includes(o.size)) d.push({ field: 'options.size', message: p.sizes.length ? 'Size must be one of: ' + p.sizes.join(', ') + '.' : 'This product has one size.' }); else v.size = o.size; }
      if (o.giftWrap !== undefined) { if (typeof o.giftWrap !== 'boolean') d.push({ field: 'options.giftWrap', message: 'giftWrap must be true or false.' }); else if (o.giftWrap) v.giftWrap = true; }
      if (o.giftMessage !== undefined && str(o.giftMessage)) { if (str(o.giftMessage).length > 150) d.push({ field: 'options.giftMessage', message: 'Gift messages are 150 characters or fewer.' }); else if (!v.giftWrap) d.push({ field: 'options.giftMessage', message: 'A gift message needs gift wrap.' }); else v.giftMessage = str(o.giftMessage); }
      if (o.protection !== undefined && o.protection !== 'none') { if (!['1y', '2y'].includes(o.protection)) d.push({ field: 'options.protection', message: 'protection must be none, 1y or 2y.' }); else if (p.category !== 'electronics') d.push({ field: 'options.protection', message: 'Protection plans are only for electronics.' }); else v.protection = o.protection; }
      return d.length ? { details: d } : { value: Object.keys(v).length ? v : null };
    }
    function extrasFor(options, p) { const o = options || {}; let e = 0; if (o.giftWrap) e += GIFT_WRAP; if (o.protection) e += round(p.price * (o.protection === '1y' ? 0.08 : 0.12)); return round(e); }
    function codCheck(view, zip) {
      if (view.total > COD_LIMIT) return 'Cash on delivery is available for orders up to $' + COD_LIMIT + '.';
      if (zip && /9$/.test(String(zip))) return 'Cash on delivery is not available for remote postal codes.';
      return null;
    }
    function hashText(t) { let h = 5381; for (let i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) >>> 0; return h.toString(36); }
    function addBusinessDays(n) { const d = new Date(); d.setHours(12, 0, 0, 0); let left = n; while (left > 0) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) left--; } return d.toISOString().slice(0, 10); }
    function validateAddress(a, prefix) {
      const d = [], p = prefix || '';
      a = a || {};
      if (str(a.fullName).length < 2) d.push({ field: p + 'fullName', message: 'Enter the recipient’s full name.' });
      if (!/^[+\d][\d\s-]{6,19}$/.test(str(a.phone))) d.push({ field: p + 'phone', message: 'Enter a phone number with 7–20 digits.' });
      if (str(a.line1).length < 3) d.push({ field: p + 'line1', message: 'Enter a street address.' });
      if (!str(a.city)) d.push({ field: p + 'city', message: 'Enter a city.' });
      if (!str(a.state)) d.push({ field: p + 'state', message: 'Enter a state or region.' });
      if (!/^[A-Za-z0-9][A-Za-z0-9 -]{2,9}$/.test(str(a.zip))) d.push({ field: p + 'zip', message: 'Enter a postal code of 3–10 characters.' });
      if (!/^[A-Z]{2}$/.test(str(a.country))) d.push({ field: p + 'country', message: 'Use a 2-letter country code like US or IN.' });
      if (a.email !== undefined && a.email !== '' && !EMAIL_RE.test(str(a.email))) d.push({ field: p + 'email', message: 'Enter a valid email address.' });
      return d;
    }
    function cleanAddress(a) { return { fullName: str(a.fullName), phone: str(a.phone), line1: str(a.line1), line2: str(a.line2), city: str(a.city), state: str(a.state), zip: str(a.zip), country: str(a.country) }; }
    function stockRaised(p, before) {
      if (before !== 0 || p.stock <= 0) return;
      db.notify.filter(n => n.productId === p.id).forEach(n => sendEmail(n.email, p.name + ' is back in stock', 'Good news!\n\n' + p.name + ' is back in stock at $' + p.price.toFixed(2) + '. Only ' + p.stock + ' available right now.\n\nOpen it in the shop: #product-' + p.id + '\n\nShopLab', 'back_in_stock', { productId: p.id }));
      db.notify = db.notify.filter(n => n.productId !== p.id);
    }
    function sweepOrders() {
      db.orders.forEach(o => {
        if (o.cancelledAt) return;
        o.notified = o.notified || {};
        const st = orderStatus(o), to = (o.shippingAddress && o.shippingAddress.email) || (db.users.find(u => u.id === o.userId) || {}).email;
        if (!to) return;
        if (['shipped', 'delivered', 'return_requested', 'refunded'].includes(st) && !o.notified.shipped) { o.notified.shipped = true; sendEmail(to, 'Order #' + o.id + ' has shipped', 'Your order #' + o.id + ' is on its way by ' + (SHIPPING[o.shippingMethod] || SHIPPING.standard).label + ' shipping.\n\nTrack it any time on the Track order page with your order number and this email address.\n\nShopLab', 'order_shipped', { orderId: o.id }); }
        if (['delivered', 'return_requested', 'refunded'].includes(st) && !o.notified.delivered) { o.notified.delivered = true; sendEmail(to, 'Order #' + o.id + ' has been delivered', 'Order #' + o.id + ' was delivered. Something wrong? You can request a return from the order page within 30 days.\n\nShopLab', 'order_delivered', { orderId: o.id }); }
      });
    }
    function findProduct(id) { return db.products.find(p => p.id === id); }
    function parseId(v) { return /^\d+$/.test(String(v)) ? parseInt(v, 10) : NaN; }

    function authenticate(headers) {
      const h = headers.authorization || '';
      if (!h) return { error: err(401, 'AUTH_REQUIRED', 'This endpoint needs a Bearer token. Log in with POST /api/auth/login.') };
      const m = /^Bearer\s+(\S+)$/i.exec(h);
      if (!m) return { error: err(401, 'MALFORMED_AUTH_HEADER', 'Use the format: Authorization: Bearer <token>.') };
      const s = db.sessions[m[1]];
      if (!s) return { error: err(401, 'INVALID_TOKEN', 'The token is not recognised. Log in again.') };
      if (s.expiresAt < Date.now()) { delete db.sessions[m[1]]; return { error: err(401, 'TOKEN_EXPIRED', 'The token has expired. Log in again.') }; }
      const user = db.users.find(u => u.id === s.userId);
      if (!user) return { error: err(401, 'INVALID_TOKEN', 'The user for this token no longer exists.') };
      return { user, token: m[1], session: s };
    }

    function createSession(user, ttl) {
      const token = 'sl_' + rid(32);
      const expiresAt = Date.now() + ttl * 1000;
      db.sessions[token] = { userId: user.id, expiresAt };
      return { token, expiresIn: ttl, expiresAt: new Date(expiresAt).toISOString() };
    }

    function getCart(userId) {
      if (!db.carts[userId]) db.carts[userId] = { items: [], coupon: null, shippingMethod: 'standard' };
      const c = db.carts[userId];
      c.items = c.items.filter(i => findProduct(i.productId));
      return c;
    }

    function cartView(userId) {
      const c = getCart(userId);
      const items = c.items.map(i => {
        const p = findProduct(i.productId);
        const extras = extrasFor(i.options, p);
        return { productId: p.id, name: p.name, sku: p.sku, emoji: p.emoji, hue: p.hue, price: p.price, extrasPerUnit: extras, unitPrice: round(p.price + extras), options: i.options || null, quantity: i.quantity, stock: p.stock, lineTotal: round((p.price + extras) * i.quantity) };
      });
      const subtotal = round(items.reduce((s, i) => s + i.lineTotal, 0));
      let discount = 0, couponNote = null;
      const coupon = c.coupon ? COUPONS[c.coupon] : null;
      if (coupon) {
        if (coupon.type === 'percent') discount = round(subtotal * coupon.value / 100);
        if (coupon.type === 'flat') {
          if (subtotal >= coupon.minSubtotal) discount = Math.min(coupon.value, subtotal);
          else couponNote = 'Add ' + round(coupon.minSubtotal - subtotal).toFixed(2) + ' more to use FLAT20.';
        }
      }
      const m = SHIPPING[c.shippingMethod] || SHIPPING.standard;
      let shipping = items.length ? m.price : 0;
      if (m.freeOver && subtotal >= m.freeOver) shipping = 0;
      if (coupon && coupon.type === 'shipping') shipping = 0;
      const tax = round(Math.max(0, subtotal - discount) * TAX_RATE);
      const total = round(Math.max(0, subtotal - discount) + shipping + tax);
      return {
        items, itemCount: items.reduce((s, i) => s + i.quantity, 0),
        coupon: coupon ? { code: coupon.code, description: coupon.description, note: couponNote } : null,
        shippingMethod: m.id, subtotal, discount: round(discount), shipping: round(shipping), taxRate: TAX_RATE, tax, total, currency: 'USD'
      };
    }

    function orderStatus(o) {
      if (o.cancelledAt) return 'cancelled';
      if (o.refundedAt) return 'refunded';
      if (o.returnRequest) return 'return_requested';
      if (o.statusOverride) return o.statusOverride;
      const mins = (Date.now() - Date.parse(o.createdAt)) / 60000;
      if (mins < 2) return 'placed';
      if (mins < 5) return 'processing';
      if (mins < 10) return 'shipped';
      return 'delivered';
    }
    function orderView(o) { const c = clone(o); c.status = orderStatus(o); delete c.notified; delete c.statusOverride; return c; }

    function validateProduct(b, partial) {
      const d = [];
      const has = k => b[k] !== undefined;
      if (!partial || has('name')) { if (str(b.name).length < 2 || str(b.name).length > 80) d.push({ field: 'name', message: 'Name must be 2–80 characters.' }); }
      if (!partial || has('category')) { if (!CATEGORIES.some(c => c.id === b.category)) d.push({ field: 'category', message: 'Category must be one of: ' + CATEGORIES.map(c => c.id).join(', ') + '.' }); }
      if (!partial || has('price')) { if (typeof b.price !== 'number' || !(b.price > 0) || b.price > 100000) d.push({ field: 'price', message: 'Price must be a number greater than 0.' }); }
      if (!partial || has('stock')) { if (!isInt(b.stock) || b.stock < 0) d.push({ field: 'stock', message: 'Stock must be a whole number of 0 or more.' }); }
      if (has('description') && typeof b.description !== 'string') d.push({ field: 'description', message: 'Description must be a string.' });
      if (has('compareAtPrice') && b.compareAtPrice !== null && (typeof b.compareAtPrice !== 'number' || !(b.compareAtPrice > 0))) d.push({ field: 'compareAtPrice', message: 'compareAtPrice must be a positive number or null.' });
      return d;
    }

    const routes = [];
    function route(method, pattern, auth, fn) {
      const keys = [];
      const re = new RegExp('^' + pattern.replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '$');
      routes.push({ method, re, keys, auth, fn });
    }

    // ---------- utilities ----------
    route('GET', '/api/health', null, () => ok(200, { status: 'ok', mode: opts.mode || 'mock', version: '1.0.0', time: new Date().toISOString(), uptimeSeconds: Math.round((Date.now() - started) / 1000) }));
    route('POST', '/api/reset', null, () => {
      const sessions = db.sessions;
      db = seed();
      Object.keys(sessions).forEach(t => { if (db.users.some(u => u.id === sessions[t].userId)) db.sessions[t] = sessions[t]; });
      return ok(200, { message: 'All data is back to the original seed.' });
    });
    route('GET', '/api/delay/:seconds', null, c => {
      const s = Number(c.params.seconds);
      if (!(s >= 0 && s <= 10)) return err(400, 'INVALID_DELAY', 'Delay must be between 0 and 10 seconds.');
      const r = ok(200, { message: 'Responded after ' + s + ' seconds.', delayedBy: s });
      r.delay = s * 1000;
      return r;
    });
    route('GET', '/api/status/:code', null, c => {
      const code = parseId(c.params.code);
      if (!(code >= 200 && code <= 599)) return err(400, 'INVALID_STATUS', 'Status code must be between 200 and 599.');
      if (code === 204 || code === 205 || code === 304) return ok(code, null);
      return ok(code, { status: code, message: 'You asked for HTTP ' + code + '.' });
    });
    route('GET', '/api/flaky', null, () => {
      if (Math.random() < 0.5) { const r = err(503, 'SERVICE_UNAVAILABLE', 'Temporary failure. Retry the request.'); r.headers['retry-after'] = '1'; return r; }
      return ok(200, { message: 'Succeeded this time.' });
    });
    route('GET', '/api/limited', null, c => {
      const key = c.headers['x-client-id'] || c.headers.authorization || 'anonymous';
      const now = Date.now();
      hits[key] = (hits[key] || []).filter(t => now - t < 60000);
      const reset = hits[key].length ? Math.ceil((hits[key][0] + 60000 - now) / 1000) : 60;
      const headers = { 'x-ratelimit-limit': '5', 'x-ratelimit-reset': String(reset) };
      if (hits[key].length >= 5) {
        const r = err(429, 'RATE_LIMITED', 'Too many requests. Try again in ' + reset + ' seconds.');
        r.headers = Object.assign(headers, { 'x-ratelimit-remaining': '0', 'retry-after': String(reset) });
        return r;
      }
      hits[key].push(now);
      headers['x-ratelimit-remaining'] = String(5 - hits[key].length);
      return ok(200, { message: 'Request accepted.', remaining: 5 - hits[key].length }, headers);
    });
    ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].forEach(m => route(m, '/api/echo', null, c => ok(200, { method: c.method, path: c.path, query: c.query, headers: c.headers, body: c.rawBody === undefined ? null : c.rawBody })));
    route('POST', '/api/upload', null, c => ok(201, { message: 'Upload received.', receivedBytes: c.req.rawLength || 0, contentType: c.headers['content-type'] || null, fileName: c.headers['x-file-name'] || null }));
    route('GET', '/api/files/sample.csv', null, () => {
      const rows = ['id,name,category,price,stock'].concat(db.products.map(p => [p.id, '"' + p.name.replace(/"/g, '""') + '"', p.category, p.price.toFixed(2), p.stock].join(',')));
      return { status: 200, raw: true, body: rows.join('\n') + '\n', headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="shoplab-products.csv"' } };
    });

    // ---------- auth ----------
    route('POST', '/api/auth/register', null, c => {
      const b = c.body, d = [];
      if (!/^[A-Za-z0-9_]{3,20}$/.test(str(b.username))) d.push({ field: 'username', message: 'Username must be 3–20 letters, numbers or underscores.' });
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str(b.email))) d.push({ field: 'email', message: 'Enter a valid email address.' });
      const pw = typeof b.password === 'string' ? b.password : '';
      if (!pwOk(pw)) d.push({ field: 'password', message: 'Password needs 8+ characters with upper and lower case, a number and a symbol.' });
      if (!str(b.firstName)) d.push({ field: 'firstName', message: 'First name is required.' });
      if (!str(b.lastName)) d.push({ field: 'lastName', message: 'Last name is required.' });
      if (d.length) return err(400, 'VALIDATION_ERROR', 'Some fields are invalid.', d);
      if (db.users.some(u => u.username.toLowerCase() === str(b.username).toLowerCase())) return err(409, 'USERNAME_TAKEN', 'That username is already registered.', [{ field: 'username', message: 'Choose a different username.' }]);
      if (db.users.some(u => u.email.toLowerCase() === str(b.email).toLowerCase())) return err(409, 'EMAIL_TAKEN', 'That email is already registered.', [{ field: 'email', message: 'Use a different email or log in.' }]);
      const user = { id: db.seq.user++, username: str(b.username), email: str(b.email), firstName: str(b.firstName), lastName: str(b.lastName), role: 'customer', status: 'active', phone: str(b.phone), password: pw, createdAt: new Date().toISOString() };
      db.users.push(user);
      sendEmail(user.email, 'Welcome to ShopLab, ' + user.firstName, 'Hi ' + user.firstName + ',\n\nYour ShopLab account (' + user.username + ') is ready. Happy testing!\n\nShopLab', 'welcome');
      const s = createSession(user, DEFAULT_TTL);
      return ok(201, Object.assign({ user: publicUser(user) }, s), { location: '/api/users/' + user.id });
    });
    route('POST', '/api/auth/login', null, c => {
      const b = c.body, d = [];
      if (!str(b.username)) d.push({ field: 'username', message: 'Username is required.' });
      if (!b.password) d.push({ field: 'password', message: 'Password is required.' });
      if (d.length) return err(400, 'VALIDATION_ERROR', 'Username and password are required.', d);
      let ttl = DEFAULT_TTL;
      if (b.expiresIn !== undefined) {
        if (!isInt(b.expiresIn) || b.expiresIn < 10 || b.expiresIn > 86400) return err(400, 'VALIDATION_ERROR', 'expiresIn must be a whole number of seconds from 10 to 86400.', [{ field: 'expiresIn', message: 'Use 10–86400.' }]);
        ttl = b.expiresIn;
      }
      const name = str(b.username), key = name.toLowerCase();
      const fail = db.loginFails[key];
      if (fail && fail.until > Date.now()) {
        const wait = Math.ceil((fail.until - Date.now()) / 1000);
        const r = err(429, 'TOO_MANY_ATTEMPTS', 'Too many failed attempts. Try again in ' + wait + ' seconds.');
        r.headers['retry-after'] = String(wait);
        return r;
      }
      const user = db.users.find(u => u.username === name || u.email.toLowerCase() === key);
      if (!user || user.password !== b.password) {
        const f = db.loginFails[key] = { count: (fail && !fail.until ? fail.count : 0) + 1, until: 0 };
        if (f.count >= 5) { f.until = Date.now() + 60000; f.count = 0; return err(401, 'INVALID_CREDENTIALS', 'Username and password do not match any user. Login is paused for 60 seconds after 5 failed attempts.'); }
        return err(401, 'INVALID_CREDENTIALS', 'Username and password do not match any user.');
      }
      delete db.loginFails[key];
      if (user.status === 'locked') return err(423, 'ACCOUNT_LOCKED', 'This account is locked. Use another test account.');
      if (user.mfa) {
        const mfaToken = 'mfa_' + rid(24), code = code6();
        db.mfa[mfaToken] = { userId: user.id, code, expiresAt: Date.now() + 300000, attempts: 0, sentAt: Date.now(), ttl };
        sendEmail(user.email, 'Your ShopLab sign-in code', 'Your sign-in code is ' + code + '.\n\nIt expires in 5 minutes. If you did not try to sign in, ignore this email.\n\nShopLab', 'otp', { code });
        return ok(200, { mfaRequired: true, mfaToken, deliveredTo: maskEmail(user.email), expiresIn: 300, message: 'Enter the 6-digit code we emailed you.' });
      }
      const r = ok(200, Object.assign({ user: publicUser(user) }, createSession(user, ttl)));
      if (user.username === 'slow_user') r.delay = 3000;
      return r;
    });
    route('GET', '/api/auth/me', 'user', c => ok(200, { user: publicUser(c.user), session: { expiresAt: new Date(c.session.expiresAt).toISOString() } }));
    route('PATCH', '/api/auth/me', 'user', c => {
      const b = c.body, d = [];
      ['firstName', 'lastName'].forEach(k => { if (b[k] !== undefined && !str(b[k])) d.push({ field: k, message: 'Cannot be empty.' }); });
      if (b.email !== undefined) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str(b.email))) d.push({ field: 'email', message: 'Enter a valid email address.' });
        else if (db.users.some(u => u.id !== c.user.id && u.email.toLowerCase() === str(b.email).toLowerCase())) return err(409, 'EMAIL_TAKEN', 'That email belongs to another account.', [{ field: 'email', message: 'Use a different email.' }]);
      }
      if (b.phone !== undefined && !/^[+\d][\d\s-]{6,19}$/.test(str(b.phone))) d.push({ field: 'phone', message: 'Enter a phone number with 7–20 digits.' });
      if (d.length) return err(400, 'VALIDATION_ERROR', 'Some fields are invalid.', d);
      ['firstName', 'lastName', 'email', 'phone'].forEach(k => { if (b[k] !== undefined) c.user[k] = str(b[k]); });
      return ok(200, { user: publicUser(c.user) });
    });
    route('POST', '/api/auth/logout', 'user', c => { delete db.sessions[c.token]; return ok(200, { message: 'Logged out.' }); });
    route('POST', '/api/auth/verify-otp', null, c => {
      const t = str(c.body.mfaToken), code = str(c.body.code);
      const d = [];
      if (!t) d.push({ field: 'mfaToken', message: 'mfaToken is required.' });
      if (!/^\d{6}$/.test(code)) d.push({ field: 'code', message: 'The code is 6 digits.' });
      if (d.length) return err(400, 'VALIDATION_ERROR', 'Send the mfaToken from login and the 6-digit code.', d);
      const ch = db.mfa[t];
      if (!ch) return err(401, 'INVALID_MFA_TOKEN', 'This sign-in attempt is not recognised. Log in again.');
      if (ch.expiresAt < Date.now()) return err(401, 'OTP_EXPIRED', 'The code has expired. Request a new one.');
      if (code !== ch.code) {
        ch.attempts += 1;
        if (ch.attempts >= 5) { delete db.mfa[t]; return err(429, 'TOO_MANY_ATTEMPTS', 'Too many wrong codes. Log in again.'); }
        return err(401, 'INVALID_OTP', 'That code is not correct. ' + (5 - ch.attempts) + ' attempts left.', [{ field: 'code', message: 'Check the code and try again.' }]);
      }
      delete db.mfa[t];
      const user = db.users.find(u => u.id === ch.userId);
      return ok(200, Object.assign({ user: publicUser(user) }, createSession(user, ch.ttl)));
    });
    route('POST', '/api/auth/email-code', null, c => {
      const email = str(c.body.email).toLowerCase();
      if (!EMAIL_RE.test(email)) return err(400, 'VALIDATION_ERROR', 'Enter a valid email address.', [{ field: 'email', message: 'Enter a valid email address.' }]);
      const user = db.users.find(u => u.email.toLowerCase() === email);
      if (user && user.status === 'locked') return err(423, 'ACCOUNT_LOCKED', 'This account is locked. Use another test account.');
      const mfaToken = 'mfa_' + rid(24), code = user ? code6() : 'none';
      db.mfa[mfaToken] = { userId: user ? user.id : null, code, expiresAt: Date.now() + 300000, attempts: 0, sentAt: Date.now(), ttl: DEFAULT_TTL };
      if (user) sendEmail(user.email, 'Your ShopLab login code', 'Use ' + code + ' to log in to ShopLab.\n\nThe code expires in 5 minutes. If you did not ask for it, ignore this email.\n\nShopLab', 'otp', { code });
      return ok(200, { mfaToken, deliveredTo: maskEmail(email), expiresIn: 300, message: 'If an account exists for that email, we sent a 6-digit code.' });
    });
    route('POST', '/api/auth/oauth', null, c => {
      const b = c.body;
      if (b.provider !== 'shoplab-id') return err(400, 'VALIDATION_ERROR', 'provider must be shoplab-id.', [{ field: 'provider', message: 'Use shoplab-id.' }]);
      if (b.consent !== true) return err(403, 'CONSENT_REQUIRED', 'You must allow ShopLab to see your name and email.');
      const user = db.users.find(u => u.username === str(b.username));
      if (!user) return err(401, 'INVALID_ACCOUNT', 'That ShopLab ID account does not exist.');
      if (user.status === 'locked') return err(423, 'ACCOUNT_LOCKED', 'This account is locked. Use another test account.');
      return ok(200, Object.assign({ user: publicUser(user), provider: 'shoplab-id' }, createSession(user, DEFAULT_TTL)));
    });
    route('POST', '/api/auth/resend-otp', null, c => {
      const ch = db.mfa[str(c.body.mfaToken)];
      if (!ch) return err(401, 'INVALID_MFA_TOKEN', 'This sign-in attempt is not recognised. Log in again.');
      const wait = Math.ceil((ch.sentAt + 30000 - Date.now()) / 1000);
      if (wait > 0) { const r = err(429, 'RESEND_TOO_SOON', 'Wait ' + wait + ' seconds before requesting another code.'); r.headers['retry-after'] = String(wait); return r; }
      if (!ch.userId) { ch.sentAt = Date.now(); return ok(200, { message: 'A new code is on its way.', resendAvailableIn: 30 }); }
      const user = db.users.find(u => u.id === ch.userId);
      Object.assign(ch, { code: code6(), expiresAt: Date.now() + 300000, attempts: 0, sentAt: Date.now() });
      sendEmail(user.email, 'Your new ShopLab sign-in code', 'Your new sign-in code is ' + ch.code + '.\n\nIt expires in 5 minutes. Earlier codes no longer work.\n\nShopLab', 'otp', { code: ch.code });
      return ok(200, { message: 'A new code is on its way.', deliveredTo: maskEmail(user.email), resendAvailableIn: 30 });
    });
    route('POST', '/api/auth/forgot-password', null, c => {
      const email = str(c.body.email).toLowerCase();
      if (!EMAIL_RE.test(email)) return err(400, 'VALIDATION_ERROR', 'Enter a valid email address.', [{ field: 'email', message: 'Enter a valid email address.' }]);
      const user = db.users.find(u => u.email.toLowerCase() === email);
      if (user) {
        const code = code6();
        db.resetCodes[user.id] = { code, expiresAt: Date.now() + 900000, attempts: 0 };
        sendEmail(user.email, 'Reset your ShopLab password', 'Someone asked to reset the password for ' + user.username + '.\n\nYour reset code is ' + code + '. It expires in 15 minutes.\n\nIf this was not you, ignore this email.\n\nShopLab', 'password_reset', { code });
      }
      return ok(200, { message: 'If an account exists for that email, we sent a reset code to it.' });
    });
    route('POST', '/api/auth/reset-password', null, c => {
      const b = c.body, email = str(b.email).toLowerCase(), d = [];
      if (!EMAIL_RE.test(email)) d.push({ field: 'email', message: 'Enter a valid email address.' });
      if (!/^\d{6}$/.test(str(b.code))) d.push({ field: 'code', message: 'The code is 6 digits.' });
      if (!pwOk(b.newPassword)) d.push({ field: 'newPassword', message: 'Password needs 8+ characters with upper and lower case, a number and a symbol.' });
      if (d.length) return err(400, 'VALIDATION_ERROR', 'Some fields are invalid.', d);
      const user = db.users.find(u => u.email.toLowerCase() === email);
      const rc = user && db.resetCodes[user.id];
      if (!rc) return err(400, 'INVALID_RESET_CODE', 'That code is not valid. Request a new one.', [{ field: 'code', message: 'Request a new code.' }]);
      if (rc.expiresAt < Date.now()) { delete db.resetCodes[user.id]; return err(400, 'RESET_CODE_EXPIRED', 'That code has expired. Request a new one.', [{ field: 'code', message: 'Request a new code.' }]); }
      if (rc.code !== str(b.code)) {
        rc.attempts += 1;
        if (rc.attempts >= 5) { delete db.resetCodes[user.id]; return err(429, 'TOO_MANY_ATTEMPTS', 'Too many wrong codes. Request a new one.'); }
        return err(400, 'INVALID_RESET_CODE', 'That code is not correct. ' + (5 - rc.attempts) + ' attempts left.', [{ field: 'code', message: 'Check the code in the email.' }]);
      }
      user.password = b.newPassword;
      delete db.resetCodes[user.id];
      Object.keys(db.sessions).forEach(t => { if (db.sessions[t].userId === user.id) delete db.sessions[t]; });
      sendEmail(user.email, 'Your ShopLab password was changed', 'The password for ' + user.username + ' was just reset. Every session was logged out.\n\nShopLab', 'password_changed');
      return ok(200, { message: 'Password updated. Log in with your new password.' });
    });
    route('POST', '/api/auth/change-password', 'user', c => {
      const b = c.body;
      if (b.currentPassword !== c.user.password) return err(400, 'INVALID_CURRENT_PASSWORD', 'Your current password is not correct.', [{ field: 'currentPassword', message: 'Check your current password.' }]);
      if (!pwOk(b.newPassword)) return err(400, 'VALIDATION_ERROR', 'Password needs 8+ characters with upper and lower case, a number and a symbol.', [{ field: 'newPassword', message: 'Use a stronger password.' }]);
      if (b.newPassword === c.user.password) return err(400, 'PASSWORD_REUSED', 'Choose a password different from the current one.', [{ field: 'newPassword', message: 'Use a new password.' }]);
      c.user.password = b.newPassword;
      Object.keys(db.sessions).forEach(t => { if (db.sessions[t].userId === c.user.id && t !== c.token) delete db.sessions[t]; });
      sendEmail(c.user.email, 'Your ShopLab password was changed', 'The password for ' + c.user.username + ' was changed. Other sessions were logged out.\n\nShopLab', 'password_changed');
      return ok(200, { message: 'Password changed. Other sessions were logged out.' });
    });

    // ---------- catalog ----------
    route('GET', '/api/categories', null, () => ok(200, { data: CATEGORIES.map(cat => Object.assign({}, cat, { productCount: db.products.filter(p => p.category === cat.id).length })) }));
    route('GET', '/api/products', null, c => {
      const q = c.query;
      let list = db.products.slice();
      const num = (k) => { if (q[k] === undefined || q[k] === '') return undefined; const n = Number(q[k]); return isNaN(n) ? NaN : n; };
      const minPrice = num('minPrice'), maxPrice = num('maxPrice'), minRating = num('minRating');
      const bad = [];
      if (Number.isNaN(minPrice)) bad.push({ field: 'minPrice', message: 'Must be a number.' });
      if (Number.isNaN(maxPrice)) bad.push({ field: 'maxPrice', message: 'Must be a number.' });
      if (Number.isNaN(minRating)) bad.push({ field: 'minRating', message: 'Must be a number.' });
      const page = q.page === undefined ? 1 : Number(q.page);
      const limit = q.limit === undefined ? 12 : Number(q.limit);
      if (!Number.isInteger(page) || page < 1) bad.push({ field: 'page', message: 'Page must be a whole number of 1 or more.' });
      if (!Number.isInteger(limit) || limit < 1 || limit > 50) bad.push({ field: 'limit', message: 'Limit must be a whole number from 1 to 50.' });
      const sorts = { featured: (a, b) => a.id - b.id, newest: (a, b) => b.id - a.id, price_asc: (a, b) => a.price - b.price, price_desc: (a, b) => b.price - a.price, rating: (a, b) => b.rating - a.rating || a.id - b.id, name_asc: (a, b) => a.name.localeCompare(b.name), name_desc: (a, b) => b.name.localeCompare(a.name) };
      const sort = q.sort || 'featured';
      if (!sorts[sort]) bad.push({ field: 'sort', message: 'Sort must be one of: ' + Object.keys(sorts).join(', ') + '.' });
      if (bad.length) return err(400, 'INVALID_QUERY', 'Some query parameters are invalid.', bad);
      if (q.search) { const s = String(q.search).toLowerCase().trim(); list = list.filter(p => (p.name + ' ' + p.description + ' ' + p.category + ' ' + p.sku).toLowerCase().includes(s)); }
      if (q.category) { const cats = String(q.category).split(',').filter(Boolean); list = list.filter(p => cats.includes(p.category)); }
      if (minPrice !== undefined) list = list.filter(p => p.price >= minPrice);
      if (maxPrice !== undefined) list = list.filter(p => p.price <= maxPrice);
      if (minRating !== undefined) list = list.filter(p => p.rating >= minRating);
      if (q.inStock === 'true') list = list.filter(p => p.stock > 0);
      if (q.onSale === 'true') list = list.filter(p => p.compareAtPrice && p.compareAtPrice > p.price);
      list.sort(sorts[sort]);
      const total = list.length;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const link = p => '</api/products?' + Object.keys(q).filter(k => k !== 'page').map(k => encodeURIComponent(k) + '=' + encodeURIComponent(q[k])).concat(['page=' + p]).join('&') + '>';
      const links = [link(1) + '; rel="first"', link(totalPages) + '; rel="last"'];
      if (page > 1) links.push(link(page - 1) + '; rel="prev"');
      if (page < totalPages) links.push(link(page + 1) + '; rel="next"');
      return ok(200, { data: list.slice((page - 1) * limit, page * limit), meta: { page, limit, total, totalPages, sort } }, { 'x-total-count': String(total), link: links.join(', ') });
    });
    route('GET', '/api/products/:id', null, c => {
      const id = parseId(c.params.id);
      if (isNaN(id)) return err(400, 'INVALID_ID', 'Product id must be a number.');
      const p = findProduct(id);
      return p ? ok(200, p) : err(404, 'PRODUCT_NOT_FOUND', 'No product has id ' + id + '.');
    });
    route('POST', '/api/products', 'admin', c => {
      const d = validateProduct(c.body, false);
      if (d.length) return err(400, 'VALIDATION_ERROR', 'Some fields are invalid.', d);
      const b = c.body, id = db.seq.product++;
      const p = { id, sku: 'SL-' + (1000 + id), name: str(b.name), category: b.category, price: round(b.price), rating: 0, ratingsCount: 0, stock: b.stock, emoji: str(b.emoji) || '📦', hue: isInt(b.hue) ? b.hue : 260, description: str(b.description), colors: Array.isArray(b.colors) ? b.colors : [], sizes: Array.isArray(b.sizes) ? b.sizes : [], compareAtPrice: typeof b.compareAtPrice === 'number' ? round(b.compareAtPrice) : null, createdAt: new Date().toISOString() };
      db.products.push(p);
      return ok(201, p, { location: '/api/products/' + id });
    });
    function updateProduct(c, partial) {
      const id = parseId(c.params.id);
      if (isNaN(id)) return err(400, 'INVALID_ID', 'Product id must be a number.');
      const p = findProduct(id);
      if (!p) return err(404, 'PRODUCT_NOT_FOUND', 'No product has id ' + id + '.');
      const d = validateProduct(c.body, partial);
      if (d.length) return err(400, 'VALIDATION_ERROR', 'Some fields are invalid.', d);
      const b = c.body, before = p.stock;
      ['name', 'description', 'emoji'].forEach(k => { if (b[k] !== undefined) p[k] = str(b[k]); else if (!partial && k === 'description') p[k] = ''; });
      ['category', 'stock', 'colors', 'sizes', 'hue'].forEach(k => { if (b[k] !== undefined) p[k] = b[k]; });
      if (b.price !== undefined) p.price = round(b.price);
      if (b.compareAtPrice !== undefined) p.compareAtPrice = b.compareAtPrice === null ? null : round(b.compareAtPrice);
      stockRaised(p, before);
      return ok(200, p);
    }
    route('PUT', '/api/products/:id', 'admin', c => updateProduct(c, false));
    route('PATCH', '/api/products/:id', 'admin', c => updateProduct(c, true));
    route('DELETE', '/api/products/:id', 'admin', c => {
      const id = parseId(c.params.id);
      if (isNaN(id)) return err(400, 'INVALID_ID', 'Product id must be a number.');
      const i = db.products.findIndex(p => p.id === id);
      if (i < 0) return err(404, 'PRODUCT_NOT_FOUND', 'No product has id ' + id + '.');
      db.products.splice(i, 1);
      Object.keys(db.wishlists).forEach(u => { db.wishlists[u] = db.wishlists[u].filter(x => x !== id); });
      return ok(204, null);
    });
    route('POST', '/api/products/:id/notify', null, c => {
      const id = parseId(c.params.id), p = findProduct(id);
      if (!p) return err(404, 'PRODUCT_NOT_FOUND', 'No product has id ' + c.params.id + '.');
      const email = str(c.body.email).toLowerCase();
      if (!EMAIL_RE.test(email)) return err(400, 'VALIDATION_ERROR', 'Enter a valid email address.', [{ field: 'email', message: 'Enter a valid email address.' }]);
      if (p.stock > 0) return err(409, 'IN_STOCK', p.name + ' is in stock, so you can buy it now.');
      if (db.notify.some(n => n.productId === id && n.email === email)) return err(409, 'ALREADY_SUBSCRIBED', email + ' is already on the list for ' + p.name + '.');
      db.notify.push({ productId: id, email, createdAt: new Date().toISOString() });
      return ok(201, { message: 'We will email ' + email + ' when ' + p.name + ' is back in stock.' });
    });
    route('GET', '/api/products/:id/reviews', null, c => {
      const id = parseId(c.params.id);
      if (!findProduct(id)) return err(404, 'PRODUCT_NOT_FOUND', 'No product has id ' + c.params.id + '.');
      return ok(200, { data: db.reviews.filter(r => r.productId === id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
    });
    route('POST', '/api/products/:id/reviews', 'user', c => {
      const id = parseId(c.params.id), p = findProduct(id);
      if (!p) return err(404, 'PRODUCT_NOT_FOUND', 'No product has id ' + c.params.id + '.');
      const d = [];
      if (!isInt(c.body.rating) || c.body.rating < 1 || c.body.rating > 5) d.push({ field: 'rating', message: 'Rating must be a whole number from 1 to 5.' });
      const text = str(c.body.comment);
      if (text.length < 5 || text.length > 500) d.push({ field: 'comment', message: 'Comment must be 5–500 characters.' });
      if (d.length) return err(400, 'VALIDATION_ERROR', 'Some fields are invalid.', d);
      if (db.reviews.some(r => r.productId === id && r.userId === c.user.id)) return err(409, 'ALREADY_REVIEWED', 'You have already reviewed this product.');
      const r = { id: db.seq.review++, productId: id, userId: c.user.id, author: c.user.firstName + ' ' + c.user.lastName.charAt(0) + '.', rating: c.body.rating, comment: text, createdAt: new Date().toISOString() };
      db.reviews.push(r);
      p.rating = Math.round(((p.rating * p.ratingsCount) + r.rating) / (p.ratingsCount + 1) * 10) / 10;
      p.ratingsCount += 1;
      return ok(201, r);
    });

    // ---------- cart ----------
    route('GET', '/api/coupons', null, () => ok(200, { data: Object.values(COUPONS).map(x => ({ code: x.code, description: x.description, expired: !!x.expired })) }));
    route('GET', '/api/shipping-methods', null, () => ok(200, { data: Object.values(SHIPPING) }));
    route('GET', '/api/delivery', null, c => {
      const zip = str(c.query.zip).toUpperCase();
      if (!/^[A-Z0-9][A-Z0-9 -]{2,9}$/.test(zip)) return err(400, 'INVALID_ZIP', 'Enter a postal code of 3–10 letters or digits.', [{ field: 'zip', message: 'Enter a postal code of 3–10 letters or digits.' }]);
      if (c.query.productId !== undefined) {
        const p = findProduct(parseId(c.query.productId));
        if (!p) return err(404, 'PRODUCT_NOT_FOUND', 'No product has id ' + c.query.productId + '.');
        if (p.stock === 0) return ok(200, { zip, deliverable: false, reason: 'OUT_OF_STOCK', message: p.name + ' is out of stock.' });
      }
      const digits = zip.replace(/\D/g, '');
      if (/^0+$/.test(digits) || zip.startsWith('99')) return ok(200, { zip, deliverable: false, reason: 'NOT_SERVED', message: 'We don’t deliver to ' + zip + ' yet.' });
      const remote = /9$/.test(zip), extra = remote ? 2 : 0;
      return ok(200, { zip, deliverable: true, remote, cashOnDelivery: !remote, options: Object.values(SHIPPING).map(m => ({ method: m.id, label: m.label, estimatedDate: addBusinessDays({ standard: 5, express: 2, overnight: 1 }[m.id] + extra) })), message: remote ? 'Remote area: deliveries take 2 extra business days and cash on delivery is unavailable.' : 'Delivery available.' });
    });
    route('GET', '/api/cart', 'user', c => ok(200, cartView(c.user.id)));
    route('GET', '/api/checkout/summary', 'user', c => {
      const pm = str(c.query.paymentMethod) || 'card';
      if (!['card', 'upi', 'netbanking', 'cod'].includes(pm)) return err(400, 'INVALID_QUERY', 'paymentMethod must be card, upi, netbanking or cod.', [{ field: 'paymentMethod', message: 'Unknown payment method.' }]);
      const view = cartView(c.user.id);
      if (!view.items.length) return err(400, 'CART_EMPTY', 'Your cart is empty.');
      const zip = str(c.query.zip).toUpperCase(), why = codCheck(view, zip), fee = pm === 'cod' && !why ? COD_FEE : 0, m = SHIPPING[view.shippingMethod];
      return ok(200, Object.assign({}, view, { shippingLabel: m.label, paymentMethod: pm, paymentFee: fee, total: round(view.total + fee), codAvailable: !why, codReason: why, estimatedDelivery: addBusinessDays({ standard: 5, express: 2, overnight: 1 }[m.id] + (/9$/.test(zip) ? 2 : 0)) }));
    });
    route('POST', '/api/cart/items', 'user', c => {
      const b = c.body;
      const qty = b.quantity === undefined ? 1 : b.quantity;
      if (!isInt(b.productId)) return err(400, 'VALIDATION_ERROR', 'productId must be a number.', [{ field: 'productId', message: 'Required number.' }]);
      if (!isInt(qty) || qty < 1 || qty > 10) return err(400, 'VALIDATION_ERROR', 'Quantity must be a whole number from 1 to 10.', [{ field: 'quantity', message: 'Use 1–10.' }]);
      const p = findProduct(b.productId);
      if (!p) return err(404, 'PRODUCT_NOT_FOUND', 'No product has id ' + b.productId + '.');
      const opt = cleanOptions(b.options, p);
      if (opt.details) return err(400, 'VALIDATION_ERROR', 'Some options are invalid.', opt.details);
      if (p.stock === 0) return err(409, 'OUT_OF_STOCK', p.name + ' is out of stock.');
      const cart = getCart(c.user.id);
      const line = cart.items.find(i => i.productId === p.id);
      const next = (line ? line.quantity : 0) + qty;
      if (next > 10) return err(409, 'QUANTITY_LIMIT', 'You can buy at most 10 of one item.');
      if (next > p.stock) return err(409, 'INSUFFICIENT_STOCK', 'Only ' + p.stock + ' of ' + p.name + ' left.');
      if (line) { line.quantity = next; if (opt.value !== undefined) line.options = opt.value; } else cart.items.push(Object.assign({ productId: p.id, quantity: qty }, opt.value ? { options: opt.value } : {}));
      return ok(201, cartView(c.user.id));
    });
    route('PATCH', '/api/cart/items/:productId', 'user', c => {
      const id = parseId(c.params.productId), cart = getCart(c.user.id);
      const line = cart.items.find(i => i.productId === id);
      if (!line) return err(404, 'ITEM_NOT_IN_CART', 'Product ' + c.params.productId + ' is not in your cart.');
      const q = c.body.quantity === undefined ? line.quantity : c.body.quantity;
      if (c.body.options !== undefined) { const opt = cleanOptions(c.body.options, findProduct(id)); if (opt.details) return err(400, 'VALIDATION_ERROR', 'Some options are invalid.', opt.details); line.options = opt.value || null; }
      if (!isInt(q) || q < 0 || q > 10) return err(400, 'VALIDATION_ERROR', 'Quantity must be a whole number from 0 to 10.', [{ field: 'quantity', message: 'Use 0–10.' }]);
      const p = findProduct(id);
      if (q > p.stock) return err(409, 'INSUFFICIENT_STOCK', 'Only ' + p.stock + ' of ' + p.name + ' left.');
      if (q === 0) cart.items = cart.items.filter(i => i !== line); else line.quantity = q;
      return ok(200, cartView(c.user.id));
    });
    route('DELETE', '/api/cart/items/:productId', 'user', c => {
      const id = parseId(c.params.productId), cart = getCart(c.user.id);
      if (!cart.items.some(i => i.productId === id)) return err(404, 'ITEM_NOT_IN_CART', 'Product ' + c.params.productId + ' is not in your cart.');
      cart.items = cart.items.filter(i => i.productId !== id);
      return ok(200, cartView(c.user.id));
    });
    route('DELETE', '/api/cart', 'user', c => { const cart = getCart(c.user.id); cart.items = []; cart.coupon = null; return ok(200, cartView(c.user.id)); });
    route('POST', '/api/cart/coupon', 'user', c => {
      const code = str(c.body.code).toUpperCase();
      if (!code) return err(400, 'VALIDATION_ERROR', 'Enter a coupon code.', [{ field: 'code', message: 'Required.' }]);
      const cp = COUPONS[code];
      if (!cp) return err(404, 'INVALID_COUPON', 'Coupon ' + code + ' does not exist.');
      if (cp.expired) return err(400, 'COUPON_EXPIRED', 'Coupon ' + code + ' has expired.');
      const view = cartView(c.user.id);
      if (!view.items.length) return err(400, 'CART_EMPTY', 'Add items before applying a coupon.');
      if (cp.minSubtotal && view.subtotal < cp.minSubtotal) return err(400, 'COUPON_MIN_NOT_MET', code + ' needs a subtotal of at least $' + cp.minSubtotal + '.');
      getCart(c.user.id).coupon = code;
      return ok(200, cartView(c.user.id));
    });
    route('DELETE', '/api/cart/coupon', 'user', c => { getCart(c.user.id).coupon = null; return ok(200, cartView(c.user.id)); });
    route('PUT', '/api/cart/shipping', 'user', c => {
      const m = str(c.body.method);
      if (!SHIPPING[m]) return err(400, 'VALIDATION_ERROR', 'Method must be standard, express or overnight.', [{ field: 'method', message: 'Unknown method.' }]);
      getCart(c.user.id).shippingMethod = m;
      return ok(200, cartView(c.user.id));
    });

    // ---------- wishlist ----------
    route('GET', '/api/wishlist', 'user', c => ok(200, { data: (db.wishlists[c.user.id] || []).map(findProduct).filter(Boolean) }));
    route('POST', '/api/wishlist', 'user', c => {
      const id = c.body.productId;
      if (!isInt(id)) return err(400, 'VALIDATION_ERROR', 'productId must be a number.', [{ field: 'productId', message: 'Required number.' }]);
      if (!findProduct(id)) return err(404, 'PRODUCT_NOT_FOUND', 'No product has id ' + id + '.');
      const w = db.wishlists[c.user.id] = db.wishlists[c.user.id] || [];
      if (w.includes(id)) return err(409, 'ALREADY_IN_WISHLIST', 'That product is already in your wishlist.');
      w.push(id);
      return ok(201, { data: w.map(findProduct).filter(Boolean) });
    });
    route('DELETE', '/api/wishlist/:productId', 'user', c => {
      const id = parseId(c.params.productId), w = db.wishlists[c.user.id] || [];
      if (!w.includes(id)) return err(404, 'NOT_IN_WISHLIST', 'Product ' + c.params.productId + ' is not in your wishlist.');
      db.wishlists[c.user.id] = w.filter(x => x !== id);
      return ok(204, null);
    });

    // ---------- addresses ----------
    const addrList = uid => (db.addresses[uid] = db.addresses[uid] || []);
    route('GET', '/api/addresses', 'user', c => ok(200, { data: addrList(c.user.id) }));
    route('POST', '/api/addresses', 'user', c => {
      const d = validateAddress(c.body, '');
      if (str(c.body.label).length > 30) d.push({ field: 'label', message: 'Label must be 30 characters or fewer.' });
      if (d.length) return err(400, 'VALIDATION_ERROR', 'The address has errors.', d);
      const list = addrList(c.user.id);
      if (list.length >= 5) return err(409, 'ADDRESS_LIMIT', 'You can save up to 5 addresses. Delete one first.');
      const a = Object.assign({ id: db.seq.address++, label: str(c.body.label) || 'Address' }, cleanAddress(c.body), { isDefault: !list.length || c.body.isDefault === true });
      if (a.isDefault) list.forEach(x => { x.isDefault = false; });
      list.push(a);
      return ok(201, a, { location: '/api/addresses/' + a.id });
    });
    function findAddr(c) { const id = parseId(c.params.id); return addrList(c.user.id).find(a => a.id === id); }
    route('PUT', '/api/addresses/:id', 'user', c => {
      const a = findAddr(c);
      if (!a) return err(404, 'ADDRESS_NOT_FOUND', 'No saved address has id ' + c.params.id + '.');
      const d = validateAddress(c.body, '');
      if (str(c.body.label).length > 30) d.push({ field: 'label', message: 'Label must be 30 characters or fewer.' });
      if (d.length) return err(400, 'VALIDATION_ERROR', 'The address has errors.', d);
      Object.assign(a, cleanAddress(c.body), { label: str(c.body.label) || a.label });
      if (c.body.isDefault === true) { addrList(c.user.id).forEach(x => { x.isDefault = false; }); a.isDefault = true; }
      return ok(200, a);
    });
    route('POST', '/api/addresses/:id/default', 'user', c => {
      const a = findAddr(c);
      if (!a) return err(404, 'ADDRESS_NOT_FOUND', 'No saved address has id ' + c.params.id + '.');
      addrList(c.user.id).forEach(x => { x.isDefault = x === a; });
      return ok(200, { data: addrList(c.user.id) });
    });
    route('DELETE', '/api/addresses/:id', 'user', c => {
      const a = findAddr(c);
      if (!a) return err(404, 'ADDRESS_NOT_FOUND', 'No saved address has id ' + c.params.id + '.');
      const list = db.addresses[c.user.id] = addrList(c.user.id).filter(x => x !== a);
      if (a.isDefault && list.length) list[0].isDefault = true;
      return ok(204, null);
    });

    // ---------- orders ----------
    route('POST', '/api/orders', 'user', c => {
      const view = cartView(c.user.id);
      if (!view.items.length) return err(400, 'CART_EMPTY', 'Your cart is empty.');
      if (c.user.username === 'error_user') return err(500, 'PAYMENT_SERVICE_UNAVAILABLE', 'The payment service failed. This user always fails at checkout.');
      let a = c.body.shippingAddress || {};
      const pay = c.body.payment || {};
      if (c.body.addressId !== undefined) {
        const saved = addrList(c.user.id).find(x => x.id === c.body.addressId);
        if (!saved) return err(404, 'ADDRESS_NOT_FOUND', 'No saved address has id ' + c.body.addressId + '.');
        a = Object.assign({ email: str((c.body.shippingAddress || {}).email) }, saved);
      }
      const d = validateAddress(a, 'shippingAddress.');
      if (c.body.billingAddress !== undefined && c.body.billingAddress !== null) validateAddress(c.body.billingAddress, 'billingAddress.').forEach(x => d.push(x));
      if (str(c.body.deliveryInstructions).length > 250) d.push({ field: 'deliveryInstructions', message: 'Delivery instructions are 250 characters or fewer.' });
      if (str(c.body.orderNotes).length > 500) d.push({ field: 'orderNotes', message: 'Order notes are 500 characters or fewer.' });
      if (c.body.addressType !== undefined && !['home', 'work'].includes(c.body.addressType)) d.push({ field: 'addressType', message: 'addressType must be home or work.' });
      let scheduled = null;
      if (c.body.scheduledDelivery) {
        const sd = c.body.scheduledDelivery, day = /^\d{4}-\d{2}-\d{2}$/.test(str(sd.date)) ? new Date(sd.date + 'T12:00:00') : null, tomorrow = new Date(); tomorrow.setHours(0, 0, 0, 0); tomorrow.setDate(tomorrow.getDate() + 1);
        if (!day || isNaN(day) || day < tomorrow) d.push({ field: 'scheduledDelivery.date', message: 'Choose a date from tomorrow onwards.' });
        else if (day.getDay() === 0) d.push({ field: 'scheduledDelivery.date', message: 'We don’t deliver on Sundays.' });
        if (!SLOTS[sd.slot]) d.push({ field: 'scheduledDelivery.slot', message: 'slot must be morning, afternoon or evening.' });
        scheduled = { date: str(sd.date), slot: sd.slot, label: SLOTS[sd.slot] };
      }
      if (d.length) return err(400, 'VALIDATION_ERROR', 'The order has errors.', d);
      const method = str(pay.method) || 'card';
      if (!['card', 'upi', 'netbanking', 'cod'].includes(method)) return err(400, 'VALIDATION_ERROR', 'payment.method must be card, upi, netbanking or cod.', [{ field: 'payment.method', message: 'Unknown payment method.' }]);
      let paymentRecord = null, fee = 0;
      if (method === 'upi') {
        const vpa = str(pay.upiId).toLowerCase();
        if (!/^[a-z0-9._-]{2,}@[a-z]{2,}$/.test(vpa)) return err(422, 'PAYMENT_INVALID', 'The payment details are not valid.', [{ field: 'payment.upiId', message: 'Enter a UPI ID like name@bank.' }]);
        if (vpa.startsWith('fail@')) return err(402, 'PAYMENT_DECLINED', 'The UPI request was declined. Use any other UPI ID to succeed.');
        paymentRecord = { method, brand: 'UPI', last4: '', label: 'UPI (' + vpa + ')' };
      } else if (method === 'netbanking') {
        if (!BANKS.includes(pay.bank)) return err(422, 'PAYMENT_INVALID', 'The payment details are not valid.', [{ field: 'payment.bank', message: 'Choose one of: ' + BANKS.join(', ') + '.' }]);
        paymentRecord = { method, brand: 'Net banking', last4: '', label: 'Net banking (' + pay.bank + ')' };
      } else if (method === 'cod') {
        const why = codCheck(view, str(a.zip));
        if (why) return err(409, 'COD_NOT_AVAILABLE', why);
        fee = COD_FEE;
        paymentRecord = { method, brand: 'Cash on delivery', last4: '', label: 'Cash on delivery' };
      }
      const num = String(pay.cardNumber || '').replace(/[\s-]/g, '');
      const pd = [];
      if (method === 'card') {
      if (str(pay.cardName).length < 2) pd.push({ field: 'payment.cardName', message: 'Enter the name on the card.' });
      if (!/^\d{13,19}$/.test(num) || !luhn(num)) pd.push({ field: 'payment.cardNumber', message: 'Card number is not valid.' });
      const em = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(str(pay.expiry));
      if (!em) pd.push({ field: 'payment.expiry', message: 'Use MM/YY.' });
      else { const now = new Date(); const y = 2000 + +em[2], mo = +em[1]; if (y < now.getFullYear() || (y === now.getFullYear() && mo < now.getMonth() + 1)) pd.push({ field: 'payment.expiry', message: 'This card has expired.' }); }
      if (!/^\d{3,4}$/.test(str(pay.cvv))) pd.push({ field: 'payment.cvv', message: 'CVV is 3 or 4 digits.' });
      if (pd.length) return err(422, 'PAYMENT_INVALID', 'The payment details are not valid.', pd);
      if (num === '4000000000000002') return err(402, 'PAYMENT_DECLINED', 'The card was declined. Use 4111 1111 1111 1111 to succeed.');
      if (num === '4000000000003220') {
        if (!str(pay.threeDSCode)) { const r = err(402, 'AUTHENTICATION_REQUIRED', 'Your bank needs you to confirm this payment.'); r.body.error.challenge = { type: '3ds', amount: view.total, hint: 'The bank code is 123456.' }; return r; }
        if (str(pay.threeDSCode) !== '123456') return err(402, 'AUTHENTICATION_FAILED', 'The bank verification code was wrong. No payment was taken.');
      }
      }
      for (const i of view.items) { const p = findProduct(i.productId); if (i.quantity > p.stock) return err(409, 'INSUFFICIENT_STOCK', 'Only ' + p.stock + ' of ' + p.name + ' left.'); }
      view.items.forEach(i => { findProduct(i.productId).stock -= i.quantity; });
      const brand = num[0] === '4' ? 'Visa' : num[0] === '5' ? 'Mastercard' : num[0] === '3' ? 'Amex' : 'Card';
      if (!paymentRecord) paymentRecord = { method: 'card', brand, last4: num.slice(-4), label: brand + ' ending ' + num.slice(-4) };
      const order = {
        id: db.seq.order++, userId: c.user.id, items: view.items, subtotal: view.subtotal, discount: view.discount, shipping: view.shipping, tax: view.tax, paymentFee: fee, total: round(view.total + fee),
        billingAddress: c.body.billingAddress ? cleanAddress(c.body.billingAddress) : null, addressType: c.body.addressType || 'home', deliveryInstructions: str(c.body.deliveryInstructions), orderNotes: str(c.body.orderNotes), scheduledDelivery: scheduled, leaveAtDoor: c.body.leaveAtDoor === true,
        coupon: view.coupon ? view.coupon.code : null, shippingMethod: view.shippingMethod,
        shippingAddress: Object.assign(cleanAddress(a), { email: str(a.email) || c.user.email }),
        payment: paymentRecord, createdAt: new Date().toISOString(), cancelledAt: null, notified: {}
      };
      db.orders.push(order);
      const cart = getCart(c.user.id); cart.items = []; cart.coupon = null;
      if (c.body.saveAddress === true && c.body.addressId === undefined) {
        const list = addrList(c.user.id), clean = cleanAddress(a);
        if (list.length < 5 && !list.some(x => x.line1 === clean.line1 && x.zip === clean.zip)) list.push(Object.assign({ id: db.seq.address++, label: 'Address ' + (list.length + 1) }, clean, { isDefault: !list.length }));
      }
      const lines = order.items.map(i => '  ' + i.name + ' x ' + i.quantity + '  $' + i.lineTotal.toFixed(2)).join('\n');
      sendEmail(order.shippingAddress.email, 'Order #' + order.id + ' confirmed', 'Hi ' + c.user.firstName + ',\n\nThanks for your order. We received order #' + order.id + '.\n\n' + lines + '\n\nSubtotal  $' + order.subtotal.toFixed(2) + (order.discount ? '\nDiscount  -$' + order.discount.toFixed(2) : '') + '\nShipping  $' + order.shipping.toFixed(2) + '\nTax       $' + order.tax.toFixed(2) + (order.paymentFee ? '\nCOD fee   $' + order.paymentFee.toFixed(2) : '') + '\nTotal     $' + order.total.toFixed(2) + '\n\nShipping to ' + order.shippingAddress.fullName + ', ' + order.shippingAddress.city + ', ' + order.shippingAddress.country + '.\nPayment: ' + order.payment.label + '.' + (scheduled ? '\nScheduled delivery: ' + scheduled.date + ', ' + scheduled.label + '.' : '') + '\n\nShopLab', 'order_confirmation', { orderId: order.id });
      return ok(201, orderView(order), { location: '/api/orders/' + order.id });
    });
    route('GET', '/api/orders', 'user', c => {
      let list = db.orders.filter(o => c.user.role === 'admin' || o.userId === c.user.id).map(orderView);
      if (c.query.status) list = list.filter(o => o.status === c.query.status);
      const s = c.query.sort || 'newest';
      const sorts = { newest: (a, b) => b.id - a.id, oldest: (a, b) => a.id - b.id, total_desc: (a, b) => b.total - a.total };
      if (!sorts[s]) return err(400, 'INVALID_QUERY', 'Sort must be newest, oldest or total_desc.');
      list.sort(sorts[s]);
      return ok(200, { data: list, meta: { total: list.length } });
    });
    function ownOrder(c) {
      const id = parseId(c.params.id);
      if (isNaN(id)) return { error: err(400, 'INVALID_ID', 'Order id must be a number.') };
      const o = db.orders.find(x => x.id === id);
      if (!o) return { error: err(404, 'ORDER_NOT_FOUND', 'No order has id ' + id + '.') };
      if (o.userId !== c.user.id && c.user.role !== 'admin') return { error: err(403, 'FORBIDDEN', 'That order belongs to another user.') };
      return { order: o };
    }
    route('GET', '/api/orders/:id', 'user', c => { const r = ownOrder(c); return r.error || ok(200, orderView(r.order)); });
    route('POST', '/api/orders/:id/cancel', 'user', c => {
      const r = ownOrder(c); if (r.error) return r.error;
      const st = orderStatus(r.order);
      if (st !== 'placed' && st !== 'processing') return err(409, 'ORDER_NOT_CANCELLABLE', 'Orders that are ' + st + ' cannot be cancelled.');
      r.order.cancelledAt = new Date().toISOString();
      r.order.items.forEach(i => { const p = findProduct(i.productId); if (p) { const before = p.stock; p.stock += i.quantity; stockRaised(p, before); } });
      sendEmail(r.order.shippingAddress.email || c.user.email, 'Order #' + r.order.id + ' was cancelled', 'Order #' + r.order.id + ' was cancelled. Your refund of $' + r.order.total.toFixed(2) + ' goes back to your original payment method (' + (r.order.payment.label || r.order.payment.brand) + ').\n\nShopLab', 'order_cancelled', { orderId: r.order.id });
      return ok(200, orderView(r.order));
    });
    route('POST', '/api/orders/:id/return', 'user', c => {
      const r = ownOrder(c); if (r.error) return r.error;
      const o = r.order;
      if (o.returnRequest) return err(409, 'RETURN_ALREADY_REQUESTED', 'A return was already requested for order #' + o.id + ' (' + o.returnRequest.rma + ').');
      const st = orderStatus(o);
      if (st !== 'delivered') return err(409, 'RETURN_NOT_ALLOWED', 'Only delivered orders can be returned. This order is ' + st.replace('_', ' ') + '.');
      const reason = str(c.body.reason), comment = str(c.body.comment), d = [];
      if (!RETURN_REASONS[reason]) d.push({ field: 'reason', message: 'Reason must be one of: ' + Object.keys(RETURN_REASONS).join(', ') + '.' });
      if (reason === 'other' && comment.length < 5) d.push({ field: 'comment', message: 'Tell us more (at least 5 characters) when the reason is other.' });
      let ids = Array.isArray(c.body.productIds) ? c.body.productIds : o.items.map(i => i.productId);
      if (!ids.length || ids.some(id => !o.items.some(i => i.productId === id))) d.push({ field: 'productIds', message: 'Choose at least one item from this order.' });
      if (d.length) return err(400, 'VALIDATION_ERROR', 'The return request has errors.', d);
      const items = o.items.filter(i => ids.includes(i.productId));
      const amount = round(items.reduce((s, i) => s + i.lineTotal, 0) * (1 + TAX_RATE));
      o.returnRequest = { rma: 'RMA-' + o.id, reason, reasonLabel: RETURN_REASONS[reason], comment, productIds: ids, refundAmount: amount, requestedAt: new Date().toISOString() };
      sendEmail(o.shippingAddress.email || c.user.email, 'Return ' + o.returnRequest.rma + ' received', 'We received your return request for order #' + o.id + '.\n\nReturn number: ' + o.returnRequest.rma + '\nReason: ' + RETURN_REASONS[reason] + '\nItems: ' + items.map(i => i.name).join(', ') + '\nExpected refund: $' + amount.toFixed(2) + '\n\nPack the items and drop them at any courier point within 14 days.\n\nShopLab', 'return_requested', { orderId: o.id, rma: o.returnRequest.rma });
      return ok(201, orderView(o));
    });
    route('POST', '/api/orders/:id/reorder', 'user', c => {
      const r = ownOrder(c); if (r.error) return r.error;
      const cart = getCart(c.user.id), added = [], skipped = [];
      r.order.items.forEach(i => {
        const p = findProduct(i.productId);
        if (!p) return skipped.push({ productId: i.productId, name: i.name, reason: 'No longer sold' });
        const line = cart.items.find(x => x.productId === p.id), have = line ? line.quantity : 0;
        const q = Math.min(i.quantity, p.stock - have, 10 - have);
        if (p.stock === 0) return skipped.push({ productId: p.id, name: p.name, reason: 'Out of stock' });
        if (q <= 0) return skipped.push({ productId: p.id, name: p.name, reason: 'Cart already holds the maximum available' });
        if (line) line.quantity += q; else cart.items.push({ productId: p.id, quantity: q });
        added.push({ productId: p.id, name: p.name, quantity: q });
      });
      return ok(200, { added, skipped, cart: cartView(c.user.id) });
    });
    route('POST', '/api/orders/track', null, c => {
      const id = Number(c.body.orderId), email = str(c.body.email).toLowerCase(), d = [];
      if (!Number.isInteger(id)) d.push({ field: 'orderId', message: 'Enter the order number.' });
      if (!EMAIL_RE.test(email)) d.push({ field: 'email', message: 'Enter the email used for the order.' });
      if (d.length) return err(400, 'VALIDATION_ERROR', 'Enter an order number and email.', d);
      const o = db.orders.find(x => x.id === id);
      const owner = o && db.users.find(u => u.id === o.userId);
      if (!o || ![(o.shippingAddress.email || '').toLowerCase(), owner ? owner.email.toLowerCase() : ''].includes(email)) return err(404, 'ORDER_NOT_FOUND', 'No order matches that number and email.');
      return ok(200, { id: o.id, status: orderStatus(o), createdAt: o.createdAt, itemCount: o.items.reduce((s, i) => s + i.quantity, 0), total: o.total, shippingMethod: o.shippingMethod, shipTo: o.shippingAddress.city + ', ' + o.shippingAddress.country, rma: o.returnRequest ? o.returnRequest.rma : null });
    });
    route('PATCH', '/api/orders/:id/status', 'admin', c => {
      const id = parseId(c.params.id), o = db.orders.find(x => x.id === id);
      if (!o) return err(404, 'ORDER_NOT_FOUND', 'No order has id ' + c.params.id + '.');
      const s = str(c.body.status), allowed = ['placed', 'processing', 'shipped', 'delivered', 'refunded'];
      if (!allowed.includes(s)) return err(400, 'VALIDATION_ERROR', 'Status must be one of: ' + allowed.join(', ') + '.', [{ field: 'status', message: 'Unknown status.' }]);
      if (o.cancelledAt || o.refundedAt) return err(409, 'ORDER_CLOSED', 'Order #' + o.id + ' is ' + orderStatus(o) + ' and cannot change.');
      if (s === 'refunded') {
        if (!o.returnRequest) return err(409, 'NO_RETURN', 'Only orders with a return request can be refunded.');
        o.refundedAt = new Date().toISOString();
        sendEmail(o.shippingAddress.email, 'Refund issued for ' + o.returnRequest.rma, 'We refunded $' + o.returnRequest.refundAmount.toFixed(2) + ' to your original payment method (' + (o.payment.label || o.payment.brand) + ').\n\nShopLab', 'refund_issued', { orderId: o.id });
      } else {
        if (o.returnRequest) return err(409, 'ORDER_CLOSED', 'Order #' + o.id + ' has a return in progress. Set it to refunded instead.');
        o.statusOverride = s;
      }
      sweepOrders();
      return ok(200, orderView(o));
    });

    // ---------- inbox, newsletter and chaos config ----------
    route('GET', '/api/inbox', null, c => {
      const e = str(c.query.email).toLowerCase();
      if (!EMAIL_RE.test(e)) return err(400, 'VALIDATION_ERROR', 'Pass the mailbox address as ?email=you@example.com.', [{ field: 'email', message: 'Enter a valid email address.' }]);
      const list = db.emails.filter(m => m.to === e).sort((a, b) => b.id - a.id);
      return ok(200, { data: list.map(m => ({ id: m.id, from: m.from, to: m.to, subject: m.subject, kind: m.kind, read: m.read, createdAt: m.createdAt, preview: m.body.replace(/\s+/g, ' ').slice(0, 90) })), meta: { total: list.length, unread: list.filter(m => !m.read).length } });
    });
    route('GET', '/api/inbox/:id', null, c => {
      const m = db.emails.find(x => x.id === parseId(c.params.id));
      if (!m) return err(404, 'EMAIL_NOT_FOUND', 'No email has id ' + c.params.id + '.');
      m.read = true;
      return ok(200, m);
    });
    route('DELETE', '/api/inbox', null, c => {
      const e = str(c.query.email).toLowerCase();
      if (!EMAIL_RE.test(e)) return err(400, 'VALIDATION_ERROR', 'Pass the mailbox address as ?email=you@example.com.');
      db.emails = db.emails.filter(m => m.to !== e);
      return ok(204, null);
    });
    route('POST', '/api/newsletter', null, c => {
      const e = str(c.body.email).toLowerCase();
      if (!EMAIL_RE.test(e)) return err(400, 'VALIDATION_ERROR', 'Enter a valid email address.', [{ field: 'email', message: 'Enter a valid email address.' }]);
      if (db.newsletter.includes(e)) return ok(200, { message: e + ' is already subscribed.' });
      db.newsletter.push(e);
      sendEmail(e, 'Your 10% welcome code', 'Thanks for subscribing to ShopLab deals.\n\nUse code SAVE10 at checkout for 10% off.\n\nShopLab', 'newsletter', { coupon: 'SAVE10' });
      return ok(201, { message: 'Subscribed. Check the inbox for your welcome code.' });
    });
    route('GET', '/api/config', null, () => ok(200, db.config));
    route('PUT', '/api/config', null, c => {
      const b = c.body, d = [];
      const lat = b.latencyMs === undefined ? db.config.latencyMs : b.latencyMs, fr = b.failureRate === undefined ? db.config.failureRate : b.failureRate;
      if (!isInt(lat) || lat < 0 || lat > 5000) d.push({ field: 'latencyMs', message: 'Use a whole number from 0 to 5000.' });
      if (!isInt(fr) || fr < 0 || fr > 50) d.push({ field: 'failureRate', message: 'Use a whole number from 0 to 50.' });
      if (d.length) return err(400, 'VALIDATION_ERROR', 'Some settings are invalid.', d);
      db.config = { latencyMs: lat, failureRate: fr };
      return ok(200, db.config);
    });

    // ---------- users ----------
    route('GET', '/api/users', 'admin', () => ok(200, { data: db.users.map(publicUser) }));
    route('GET', '/api/users/:id', 'admin', c => { const u = db.users.find(x => x.id === parseId(c.params.id)); return u ? ok(200, publicUser(u)) : err(404, 'USER_NOT_FOUND', 'No user has id ' + c.params.id + '.'); });

    function handle(req) {
      const method = String(req.method || 'GET').toUpperCase();
      const path = (String(req.path || '/').replace(/\/+$/, '')) || '/';
      const headers = {};
      Object.keys(req.headers || {}).forEach(k => { headers[k.toLowerCase()] = String(req.headers[k]); });
      let res = null;
      const exempt = ['/api/config', '/api/reset', '/api/health'].includes(path) || !path.startsWith('/api/');
      try {
        sweepOrders();
        if (method === 'OPTIONS') res = ok(204, null);
        else if (!exempt && db.config.failureRate > 0 && Math.random() * 100 < db.config.failureRate) res = err(503, 'CHAOS_FAILURE', 'Injected failure: chaos mode is on (' + db.config.failureRate + '% failure rate). Retry the request.');
        else if (req.bodyError) res = err(400, 'MALFORMED_JSON', 'The request body is not valid JSON.');
        else {
          let match = null, pathHit = false;
          for (const r of routes) {
            const m = r.re.exec(path);
            if (!m) continue;
            pathHit = true;
            if (r.method !== method) continue;
            const params = {}; r.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); });
            match = { r, params }; break;
          }
          if (!match) res = pathHit ? err(405, 'METHOD_NOT_ALLOWED', method + ' is not supported on ' + path + '.') : err(404, 'ROUTE_NOT_FOUND', 'No endpoint matches ' + method + ' ' + path + '.');
          else {
            const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
            const ctx = { req, method, path, params: match.params, query: req.query || {}, headers, body, rawBody: req.body };
            if (match.r.auth) {
              const a = authenticate(headers);
              if (a.error) res = a.error;
              else {
                ctx.user = a.user; ctx.token = a.token; ctx.session = a.session;
                if (match.r.auth === 'admin' && a.user.role !== 'admin') res = err(403, 'FORBIDDEN', 'This endpoint is for admin users only.');
              }
            }
            if (!res) res = match.r.fn(ctx);
          }
        }
      } catch (e) {
        res = err(500, 'INTERNAL_ERROR', 'Unexpected server error: ' + e.message);
      }
      if (method === 'GET' && res.status === 200 && !res.raw && res.body) {
        if (/^\/api\/(products(\/\d+)?|categories)$/.test(path)) {
          const tag = 'W/"' + hashText(JSON.stringify(res.body)) + '"';
          if (headers['if-none-match'] === tag) res = { status: 304, body: null, headers: {}, delay: res.delay };
          res.headers = Object.assign(res.headers || {}, { etag: tag, 'cache-control': 'no-cache' });
        } else if (headers.authorization) res.headers = Object.assign(res.headers || {}, { 'cache-control': 'no-store' });
      }
      res.headers = Object.assign({ 'x-request-id': 'req_' + rid(12), 'x-powered-by': 'ShopLab' }, res.headers || {});
      if (res.body !== null && res.body !== undefined && !res.raw) res.headers['content-type'] = 'application/json; charset=utf-8';
      res.delay = (res.delay || 0) + (exempt ? 0 : db.config.latencyMs);
      save();
      return res;
    }

    function reload() { if (!opts.load) return; try { const d = opts.load(); if (d && d.version === 2) db = d; } catch (e) { /* keep current */ } }
    return { handle, reload, reset: () => { db = seed(); save(); } };
  }

  return { createBackend, seed, PASSWORD, TEST_USERS, ENDPOINTS, GROUPS, CATEGORIES, SHIPPING, COUPONS, RETURN_REASONS, BANKS, SLOTS, GIFT_WRAP, COD_FEE, COD_LIMIT };
})();

/* ShopLab: serves the practice REST API at <site>/api/* from inside the browser,
   so pages make real fetch() requests that show up in DevTools and test tools. */
(function () {
  'use strict';
  const DB_NAME = 'shoplab', STORE = 'kv';
  function openDb() {
    return new Promise((resolve, reject) => {
      const r = indexedDB.open(DB_NAME, 1);
      r.onupgradeneeded = () => r.result.createObjectStore(STORE);
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
  }
  async function idbGet(key) {
    const d = await openDb();
    return new Promise((resolve, reject) => { const q = d.transaction(STORE).objectStore(STORE).get(key); q.onsuccess = () => resolve(q.result); q.onerror = () => reject(q.error); });
  }
  async function idbSet(key, value) {
    const d = await openDb();
    return new Promise((resolve, reject) => { const tx = d.transaction(STORE, 'readwrite'); tx.objectStore(STORE).put(value, key); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); });
  }

  let backendPromise = null;
  function backend() {
    if (!backendPromise) backendPromise = (async () => {
      let saved = null;
      try { saved = await idbGet('db'); } catch (e) { saved = null; }
      let pending = Promise.resolve();
      const b = ShopLabCore.createBackend({
        mode: 'service-worker',
        load: () => (saved ? JSON.parse(saved) : null),
        save: db => { const snap = JSON.stringify(db); pending = pending.then(() => idbSet('db', snap)).catch(() => {}); }
      });
      b.flush = () => pending;
      return b;
    })();
    return backendPromise;
  }

  self.addEventListener('install', () => self.skipWaiting());
  self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
  self.addEventListener('message', e => { if (e.data === 'claim') self.clients.claim(); });

  self.addEventListener('fetch', e => {
    const url = new URL(e.request.url), scope = new URL(self.registration.scope);
    if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname + 'api/')) return;
    e.respondWith(handle(e.request, url, scope));
  });

  async function handle(req, url, scope) {
    const started = Date.now();
    const path = '/' + url.pathname.slice(scope.pathname.length);
    const headers = {};
    req.headers.forEach((v, k) => { headers[k] = v; });
    const raw = req.method === 'GET' || req.method === 'HEAD' ? '' : await req.text();
    let body, bodyError = false;
    if (raw) {
      if ((headers['content-type'] || '').includes('json')) { try { body = JSON.parse(raw); } catch (err) { bodyError = true; } }
      else body = raw;
    }
    const query = {};
    url.searchParams.forEach((v, k) => { query[k] = v; });
    let out;
    try {
      const b = await backend();
      out = b.handle({ method: req.method, path, query, headers, body, bodyError, rawLength: new TextEncoder().encode(raw).length });
      await b.flush();
    } catch (err) {
      out = { status: 500, headers: { 'content-type': 'application/json; charset=utf-8' }, body: { error: { code: 'INTERNAL_ERROR', message: 'The in-browser API failed: ' + err.message } } };
    }
    if (out.delay) await new Promise(r => setTimeout(r, out.delay));
    const h = new Headers(out.headers || {});
    h.set('x-served-by', 'ShopLab service worker');
    h.set('x-response-time', (Date.now() - started) + 'ms');
    const noBody = out.body === null || out.body === undefined || [204, 205, 304].includes(out.status) || req.method === 'HEAD';
    return new Response(noBody ? null : (out.raw ? String(out.body) : JSON.stringify(out.body, null, 2)), { status: out.status, headers: h });
  }
})();
