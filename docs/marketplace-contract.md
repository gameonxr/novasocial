# NovaSocial Marketplace Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted Marketplace feature without triggering purchases or persistence.

## Contract

`showMarketplace()` creates a `🛍️ Marketplace` modal and renders the Digital products & services heading, a `listProduct()` Sell action, and six product fixtures with title, price, seller, icon, gradient, and rating metadata. Each product card delegates to `buyProduct(title, price)`.

`listProduct()` delegates back to `showMarketplace()`. `buyProduct(title, price)` requires confirmation before emitting the existing order-placed toast; cancellation returns without side effects. Payment processing and order persistence remain outside this module.

The harness is static and documentation-only. It does not open the Marketplace, prompt for confirmation, or initiate a purchase.

## Harness coverage

`docs/marketplace-contract-harness.js` validates modal construction, six product fixtures, metadata, Sell routing, buy routing, confirmation gating, cancellation path, and order feedback.

## References

1. [`marketplace.js`](../src/features/marketplace.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

