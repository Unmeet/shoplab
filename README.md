# ShopLab: practice store for UI and API test automation

ShopLab is a small e-commerce store with a REST API behind it. Everything is built to be automated: stable `id` and `data-testid` hooks, client-side and server-side validation, test users that fail on purpose, and endpoints for practising retries, timeouts and rate limits.

## Run it

You need Node.js 18 or newer. There is nothing to install.

```bash
node server.js
```

Then open:

| What | URL |
|---|---|
| Store | http://localhost:3000 |
| API base | http://localhost:3000/api |
| Health check | http://localhost:3000/api/health |

Options:

```bash
PORT=8080 node server.js           # another port
SHOPLAB_PERSIST=1 node server.js   # keep data in shoplab-data.json between restarts
```

By default data lives in memory and resets when the server stops. You can also reset it at any time with `POST /api/reset` or the "Reset store data" link in the store. That makes test runs repeatable: call reset in your `beforeAll` hook.

## Test accounts

The password for every account is `Practice@123`.

| Username | Behaviour |
|---|---|
| `standard_user` | Normal customer. Use this for happy paths. |
| `locked_user` | Login fails with HTTP 423 `ACCOUNT_LOCKED`. |
| `slow_user` | Login takes 3 seconds. Practise waits and timeouts. |
| `error_user` | Placing an order always fails with HTTP 500. |
| `admin` | Can create, update and delete products and list users. |

## Test data

| Thing | Values |
|---|---|
| Approved card | `4111 1111 1111 1111`, any future expiry (MM/YY), any 3-digit CVV |
| Declined card | `4000 0000 0000 0002` returns HTTP 402 `PAYMENT_DECLINED` |
| Coupons | `SAVE10` (10% off), `FLAT20` ($20 off orders of $100+), `FREESHIP`, `EXPIRED5` (always rejected) |
| Shipping | standard $5.99 (free from $75), express $14.99, overnight $29.99 |
| Tax | 8% of the subtotal after discount |
| Out of stock | Product 3 (Nova Bluetooth Speaker) and product 15 (APIs Explained) |
| Low stock | Product 20 has 3 left; product 18 has 8 |
| Order status | Moves from `placed` (0–2 min) to `processing` (2–5) to `shipped` (5–10) to `delivered`. Only placed and processing orders can be cancelled. |

## Pages

| Route | What to practise |
|---|---|
| `/#shop` | Filters, sorting, pagination, search suggestions, skeleton loaders |
| `/#product-1` … `/#product-24` | Radio swatches, required size select, quantity stepper, tabs, review form |
| `/#login`, `/#register` | Validation messages, password visibility toggle, strength meter, slow login |
| `/#cart` | Quantity changes, remove, coupons with error messages, confirmation modal |
| `/#checkout` | Four-step wizard, field validation, card formatting, terms checkbox, payment errors |
| `/#orders`, `/#order-1001` | Tables, filtering, status that changes over time, cancel with confirmation |
| `/#account` | Profile update, reading the API token from the page |
| `/#admin` | Inline editable table, create and delete (log in as `admin`) |
| `/#lab` | 17 classic automation exercises (see below) |
| `/#api` | A built-in API client with every endpoint preloaded |

### Practice lab sections

Alerts, confirm and prompt dialogs; new tabs and popup windows; an iframe with a nested iframe; delayed elements and buttons that enable after 5 seconds; ids that change on every click and lists that re-render (stale elements); hover menus, double-click, right-click context menu, press-and-hold and tooltips; HTML5 drag and drop (single target, task board, sortable list); keyboard keys and combinations; autocomplete, native and multi-select, a custom dropdown with no `<select>`, radios with a disabled option, a select-all checkbox with an indeterminate state, date, slider and toggle switch; file upload (input and drop zone) and CSV download; a searchable, sortable, paginated web table with add, edit and delete; open shadow DOM with a nested shadow root; a progress bar to stop at 75%; infinite scroll; broken images and links; modals and toasts; and a section with no ids at all for relative and text locators.

## API reference

All request and response bodies are JSON. Send the token from login as `Authorization: Bearer <token>`. Tokens last one hour unless you pass `expiresIn` (10–86400 seconds) to login.

Every error has the same shape:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Some fields are invalid.", "details": [ { "field": "email", "message": "Enter a valid email address." } ] } }
```

Every response carries an `X-Request-Id` header.

### Auth

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | none | 201 with token. 400 on validation, 409 if username or email is taken. |
| POST | `/api/auth/login` | none | 200 with token. 400, 401 `INVALID_CREDENTIALS`, 423 `ACCOUNT_LOCKED`. |
| GET | `/api/auth/me` | user | Current user and session expiry. |
| PATCH | `/api/auth/me` | user | Update firstName, lastName, email, phone. |
| POST | `/api/auth/logout` | user | Invalidates the token. |

### Products

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/products` | none | Query: `search`, `category` (comma list), `minPrice`, `maxPrice`, `minRating`, `inStock=true`, `sort` (featured, newest, price_asc, price_desc, rating, name_asc, name_desc), `page`, `limit` (1–50). Returns `{ data, meta }`. 400 `INVALID_QUERY` for bad values. |
| GET | `/api/products/:id` | none | 400 for a non-numeric id, 404 if missing. |
| POST | `/api/products` | admin | 201 with `Location` header. Requires name, category, price, stock. |
| PUT | `/api/products/:id` | admin | Full replace. |
| PATCH | `/api/products/:id` | admin | Partial update. |
| DELETE | `/api/products/:id` | admin | 204. |
| GET | `/api/categories` | none | With product counts. |
| GET | `/api/products/:id/reviews` | none | |
| POST | `/api/products/:id/reviews` | user | rating 1–5, comment 5–500 chars. 409 if you already reviewed it. |

### Cart and wishlist

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/cart` | user | Items, subtotal, discount, shipping, tax, total. |
| POST | `/api/cart/items` | user | `{ productId, quantity }`. 409 `OUT_OF_STOCK`, `INSUFFICIENT_STOCK`, `QUANTITY_LIMIT` (max 10 per item). |
| PATCH | `/api/cart/items/:productId` | user | `{ quantity }`; 0 removes. |
| DELETE | `/api/cart/items/:productId` | user | |
| DELETE | `/api/cart` | user | Empties the cart. |
| POST | `/api/cart/coupon` | user | `{ code }`. 404 unknown, 400 expired or minimum not met. |
| DELETE | `/api/cart/coupon` | user | |
| PUT | `/api/cart/shipping` | user | `{ method: "standard" | "express" | "overnight" }` |
| GET | `/api/coupons`, `/api/shipping-methods` | none | Reference data. |
| GET | `/api/wishlist` | user | |
| POST | `/api/wishlist` | user | `{ productId }`. 409 if already saved. |
| DELETE | `/api/wishlist/:productId` | user | 204. |

### Orders and users

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/orders` | user | `{ shippingAddress, payment }`. 400 address errors, 422 card format errors, 402 declined, 409 stock, 500 for `error_user`. |
| GET | `/api/orders` | user | Query: `status`, `sort` (newest, oldest, total_desc). Admin sees all orders. |
| GET | `/api/orders/:id` | user | 403 for another user’s order. |
| POST | `/api/orders/:id/cancel` | user | 409 once shipped. Restores stock. |
| GET | `/api/users`, `/api/users/:id` | admin | |

### Utilities for resilience testing

| Method | Path | Notes |
|---|---|---|
| GET | `/api/delay/:seconds` | Waits 0–10 seconds before responding. |
| GET | `/api/status/:code` | Responds with any status from 200 to 599. |
| GET | `/api/flaky` | 503 with `Retry-After` about half the time. |
| GET | `/api/limited` | 5 requests per minute per client (`X-Client-Id` header, or token, or anonymous). Then 429 with `Retry-After` and `X-RateLimit-*` headers. |
| ANY | `/api/echo` | Returns your method, path, query, headers and body. |
| POST | `/api/upload` | Accepts any body; reports bytes received and content type. |
| GET | `/api/files/sample.csv` | CSV download with `Content-Disposition: attachment`. |
| POST | `/api/reset` | Back to the original seed. Tokens stay valid. |

Unknown paths return 404 `ROUTE_NOT_FOUND`; a known path with the wrong method returns 405 `METHOD_NOT_ALLOWED`; malformed JSON returns 400 `MALFORMED_JSON`.

## Postman

Import `shoplab.postman_collection.json`. Run **POST /api/auth/login** first: its test script stores the token in the `token` collection variable, and every other request sends it. Change the login body to `admin` before running admin requests. The `baseUrl` variable defaults to `http://localhost:3000`.

## Starter snippets

**Playwright (TypeScript), UI and API in one test**

```ts
import { test, expect } from '@playwright/test';

test('standard user buys a product', async ({ page, request }) => {
  await request.post('http://localhost:3000/api/reset');
  await page.goto('http://localhost:3000/#login');
  await page.getByTestId('username').fill('standard_user');
  await page.getByTestId('password').fill('Practice@123');
  await page.getByTestId('login-button').click();
  await expect(page.getByTestId('user-menu-button')).toContainText('Sam');

  await page.goto('http://localhost:3000/#product-1');
  await page.getByTestId('pdp-add-to-cart').click();
  await expect(page.getByTestId('cart-count')).toHaveText('1');
});
```

**REST Assured (Java)**

```java
String token = given().contentType("application/json")
    .body("{\"username\":\"standard_user\",\"password\":\"Practice@123\"}")
    .post("http://localhost:3000/api/auth/login")
    .then().statusCode(200).extract().path("token");

given().auth().oauth2(token).contentType("application/json")
    .body("{\"productId\":3,\"quantity\":1}")
    .post("http://localhost:3000/api/cart/items")
    .then().statusCode(409).body("error.code", equalTo("OUT_OF_STOCK"));
```

**Selenium (Python), frames and shadow DOM**

```python
driver.get("http://localhost:3000/#lab")
driver.switch_to.frame("outer-frame")
driver.find_element(By.ID, "frame-email").send_keys("me@example.com")
driver.find_element(By.ID, "frame-subscribe").click()
driver.switch_to.default_content()

root = driver.find_element(By.ID, "promo-widget").shadow_root
root.find_element(By.CSS_SELECTOR, "#shadow-input").send_keys("SHADOW50")
root.find_element(By.CSS_SELECTOR, "#shadow-apply").click()
```

## Exercise ideas

1. Log in as each test user and assert the exact outcome (success, 423, a 3-second wait, a checkout 500).
2. Write a data-driven test for every coupon, asserting the discount and total.
3. Verify the cart total equals subtotal minus discount plus shipping plus 8% tax, through both the UI and `GET /api/cart`.
4. Run a full checkout through the API only, then open `/#order-<id>` and check the UI agrees.
5. Poll `GET /api/orders/:id` until the status is `processing`, with a timeout.
6. Add retry logic that turns `/api/flaky` into a reliable call, honouring `Retry-After`.
7. Hit `/api/limited` until you get 429, then wait for the reset and confirm the next call passes.
8. Validate response schemas for products, cart and orders (JSON Schema, Zod or Pydantic).
9. As `admin`, create a product with the API, find it in the shop by search, then delete it and confirm a 404.
10. Contract-test negative paths: missing token, malformed token, expired token (`expiresIn: 10`), wrong role, wrong method, bad JSON.
11. Sort the web table by salary and assert the column really is in descending order.
12. Drag every card on the task board to "Done" and assert the counters.
