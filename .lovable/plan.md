## Demo E-Commerce Account Pages

Build frontend-only demo pages using localStorage for mock persistence:

### Pages to Create:
1. **My Account Dashboard** (`/account`) — Overview with user info, recent orders, quick links
2. **Order History** (`/account/orders`) — List of past orders with status badges
3. **Order Detail** (`/account/orders/:id`) — Full order details with timeline, items, totals
4. **Profile Settings** (`/account/profile`) — Edit name, email, phone, address (localStorage)
5. **Address Book** (`/account/addresses`) — Manage saved shipping addresses

### Supporting Changes:
- **Auth Guard** — Simple component that redirects to `/login` if not "logged in" (localStorage flag)
- **Mock Auth Context** — Track login state with localStorage, provide user data
- **Update Login/Signup** — Set localStorage flag on demo login, redirect to account
- **Update Header** — Show user avatar/menu when "logged in" with links to account pages
- **Update Checkout** — Save completed orders to localStorage for order history
- **Navigation** — Add account links in header dropdown

### Mock Data:
- Pre-seed a few demo orders on first visit
- Orders link to products from existing `products.ts` data
