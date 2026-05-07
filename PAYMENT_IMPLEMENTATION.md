# Bangladesh Payment Integration — Implementation Plan

## Overview

Add multi-gateway payment support for Bangladesh market:
- **SSLCommerz** — all-in-one gateway (bKash, Nagad, Rocket, cards, net banking via SSLCommerz UI)
- **PortWallet** — alternative gateway (cards + mobile banking)
- **Cash on Delivery** — existing, unchanged

> **Why not standalone bKash/Nagad/Rocket?**
> Direct merchant API access requires official merchant account approval (weeks/months, trade license, TIN, bank docs).
> SSLCommerz already has bKash/Nagad/Rocket partnerships — customer selects their preferred MFS *inside* SSLCommerz UI.
> Single SSLCommerz merchant account covers all BD payment channels automatically.

---

## Architecture

```
settings.payment_settings JSON   ← gateway credentials (admin only, NEVER sent to frontend)
payment_methods table            ← what shows in checkout (admin enables per gateway)
StorefrontOrderController        ← creates order, routes to correct gateway
GatewayController                ← handles SSLCommerz/PortWallet callbacks
```

### Flow by gateway_type

```
cod
  └─ Place order → return order → success page (current behavior)

sslcommerz / portwallet
  └─ Place order (payment_status = pending_payment)
  └─ Backend calls gateway init API → returns payment_url
  └─ Frontend: window.location.href = payment_url
  └─ Gateway handles payment UI (bKash, Nagad, Rocket, card all inside gateway)
  └─ Gateway POSTs to backend callback URL
  └─ Backend verifies IPN/signature → marks payment_status = paid
  └─ Redirect → /order/result?invoice=xxx&status=success|fail|cancel
```

---

## Phase 1 — Database Migrations

### Migration 1: Add gateway_type to payment_methods

**File:** `database/migrations/xxxx_add_gateway_type_to_payment_methods.php`

```php
$table->string('gateway_type')->default('cod')->after('icon');
// Values: cod | sslcommerz | portwallet
```

### Migration 2: Add payment_transaction_id to sells

**File:** `database/migrations/xxxx_add_payment_transaction_id_to_sells.php`

```php
$table->string('payment_transaction_id')->nullable()->after('payment_status');
```

---

## Phase 2 — Gateway Credentials in settings.payment_settings

Admin saves via existing `PATCH /api/settings/payment`. Stored as JSON:

```json
{
  "sslcommerz": {
    "enabled": true,
    "store_id": "xxxxx",
    "store_passwd": "xxxxx",
    "sandbox": true
  },
  "portwallet": {
    "enabled": true,
    "app_key": "xxxxx",
    "app_secret": "xxxxx",
    "sandbox": true
  }
}
```

> **Security:** Credentials NEVER exposed to frontend. Admin panel reads/writes only.

---

## Phase 3 — Backend Files

### New Files

| File | Purpose |
|------|---------|
| `app/Services/Gateway/SSLCommerzService.php` | Init payment session, verify IPN |
| `app/Services/Gateway/PortWalletService.php` | Init payment session, verify callback |
| `app/Http/Controllers/Api/Gateway/GatewayController.php` | Handle callbacks, update order, redirect frontend |

### Modified Files

| File | Change |
|------|--------|
| `app/Models/PaymentMethod.php` | Add `gateway_type` to `$fillable` |
| `app/Models/Sell.php` | Add `payment_transaction_id` to `$fillable` |
| `app/Http/Controllers/Api/V1/PaymentMethodController.php` | Add `gateway_type` to validate + `format()` |
| `app/Http/Controllers/Api/Storefront/StorefrontController.php` | Expose `gateway_type` in response |
| `app/Http/Controllers/Api/Storefront/StorefrontOrderController.php` | Branch by `gateway_type` |
| `database/seeders/PaymentMethodSeeder.php` | Add SSLCommerz + PortWallet entries |
| `routes/api.php` | Add gateway callback routes |

### New Routes (public — gateway POSTs here)

```php
Route::prefix('gateway')->group(function () {
    Route::post('/sslcommerz/success',  [GatewayController::class, 'sslSuccess']);
    Route::post('/sslcommerz/fail',     [GatewayController::class, 'sslFail']);
    Route::post('/sslcommerz/cancel',   [GatewayController::class, 'sslCancel']);
    Route::post('/sslcommerz/ipn',      [GatewayController::class, 'sslIpn']);
    Route::post('/portwallet/callback', [GatewayController::class, 'portwalletCallback']);
});
```

### StorefrontOrderController@store — gateway branch

```php
$gatewayType = $paymentMethod->gateway_type ?? 'cod';

if (in_array($gatewayType, ['sslcommerz', 'portwallet'])) {
    // Create order with payment_status = 'pending_payment'
    // Call gateway init → get payment_url
    // Return: { order, payment_url }
} else {
    // cod — current behavior
    // Create order with payment_status = 'pending'
    // Return: { order }
}
```

---

## Phase 4 — Frontend Files

### `src/services/paymentMethodApi.ts`

```ts
export interface PaymentMethod {
  id: number
  name: string
  description: string | null
  icon: string | null
  gateway_type: 'cod' | 'sslcommerz' | 'portwallet'
}
```

### `src/services/orderApi.ts`

```ts
// place() response:
export interface PlaceOrderResponse {
  order: ApiOrder
  payment_url?: string   // present only for sslcommerz / portwallet
}
```

### `src/pages/Checkout.tsx` — Step 2 UI

| gateway_type | UI shows |
|---|---|
| `cod` | Nothing extra |
| `sslcommerz` | "Supports bKash, Nagad, Rocket, Cards" chip + redirect badge |
| `portwallet` | "Supports Cards, Mobile Banking" chip + redirect badge |

### `src/pages/Checkout.tsx` — Step 3 place order

```ts
if (['sslcommerz', 'portwallet'].includes(gateway_type)) {
  const { payment_url } = await placeOrder(payload)
  window.location.href = payment_url   // redirect to gateway
} else {
  await placeOrder(payload)
  setStep(4)   // existing COD success flow
}
```

### New Files

| File | Purpose |
|------|---------|
| `src/pages/OrderResult.tsx` | `/order/result?invoice=xxx&status=success|fail|cancel` |
| `src/App.tsx` | Register `/order/result` route |

---

## Implementation Order

1. Phase 1 — Migrations (2 files)
2. Phase 2 — Update seeder
3. Phase 3a — Update models (PaymentMethod, Sell)
4. Phase 3b — Update PaymentMethodController + StorefrontController
5. Phase 3c — SSLCommerzService + PortWalletService
6. Phase 3d — GatewayController + routes
7. Phase 3e — StorefrontOrderController gateway branch
8. Phase 4a — Frontend: paymentMethodApi.ts + orderApi.ts
9. Phase 4b — Frontend: Checkout.tsx changes
10. Phase 4c — Frontend: OrderResult.tsx + App.tsx route

---

## Key Constraints

- Credentials stored server-side only — never in API responses
- `gateway_type` is public — safe in `/api/store/payment-methods`
- SSLCommerz/PortWallet orders: `pending_payment` until IPN verified
- COD orders: `pending` — admin marks paid manually
- Gateway callback routes excluded from auth middleware
