# Current Theme Audit

## Scope and source files reviewed

This audit covers the requested context, configuration, product template, product sections and snippets, global assets, and runtime dependencies. `AI_CONTEXT.md` defines a luxury, performance-first, native-Shopify direction with Theme Editor support, localization, metafields, accessibility, and no app dependency. `docs/Vision.md`, `docs/Architecture.md`, `docs/Design-System.md`, and `docs/Coding-Standards.md` are currently empty.

## 1. Current theme architecture

The repository is a Shopify OS 2.0 theme built around JSON templates, Liquid sections, snippets, and a large shared asset layer.

- `layout/theme.liquid` owns the document shell, `content_for_header`, global CSS/script snippets, header/footer section groups, popups, mobile toolbar, sidebar, and optional custom JavaScript.
- Global configuration is split between `config/settings_schema.json` (21 settings groups) and `config/settings_data.json` (the active merchant configuration).
- The active configuration uses the `default` global product-page layout, Poppins typography, lazy loading, no wishlist, no quick shop, no currency selector, no hover animation, and no custom JS.
- Product rendering is template-led: `templates/product.json` composes a disabled image-banner section, the main product section, an apps section, recently viewed products, and product recommendations.
- The product template’s main section is `main-product-gallery`, rather than the generic `main-product` router. Its settings currently enable the cinematic gallery, sticky product information, sticky add-to-cart, always-on mobile sticky add-to-cart, horizontal tabs, and mobile tab popups.
- There are seven main-product section variants plus the generic router: default, gallery, full-width, full-width-2, left thumbnails, right thumbnails, left/right sidebar, and horizontal-tabs-without-sidebar. These variants delegate to similarly named `product-page-*.liquid` snippets.

## 2. Product page rendering flow

1. `layout/theme.liquid` loads `variable`, `global-style`, and `global-script` in the document head. It renders `content_for_layout` inside `#MainContent`, then loads `global-script-2` near the end of the body.
2. Shopify resolves `templates/product.json`. The current order is: disabled image banner, `main-product-gallery`, an apps section, recently viewed, and recommendations.
3. `sections/main-product-gallery.liquid` loads product, price, badge, rich-text, share, tab, product-form, and grid CSS, then renders `snippets/product-page-gallery.liquid`.
4. `product-page-gallery` derives product state, section settings, metafields, block configuration, gallery behavior, tabs, and sticky-cart settings. It renders the media/gallery area and a block-driven product-information column.
5. The active cinematic media path renders `snippets/aura-product-gallery.liquid`; the legacy path remains available behind the section setting. The cinematic path loads its scoped CSS and JavaScript assets.
6. Product-information blocks render focused snippets such as title, price, product info, variant picker, size-chart/compare controls, quantity, buy buttons, delivery time, pickup availability, trust content, and product tabs.
7. Product tabs render through `halo-product-tab.liquid`. Description and custom metafield blocks are supported. The active template includes `custom.fabric_story` and `custom.craftsmanship` custom tab blocks.
8. Conditional functionality loads product-specific JavaScript for variants, sticky add-to-cart, model media, zoom/fancybox/custom cursor on legacy gallery paths, bundles, delivery time, quick order lists, and complementary products.

## 3. Relevant sections and snippets

### Product-detail sections

- `main-product-gallery.liquid` is the active product-detail entry point.
- `main-product.liquid` is a router based on the global `settings.product_page_layout` setting.
- `main-product-full-width.liquid`, `main-product-full-width-2.liquid`, `main-product-left-thumbs.liquid`, `main-product-right-thumbs.liquid`, `main-product-left-right-sidebar.liquid`, and `main-product-horizontal-tabs-no-sidebar.liquid` are alternate PDP wrappers.
- `featured-product.liquid` is a separate, full-featured product implementation for non-PDP placement.
- `product-recommendations.liquid` and `product-recently-viewed.liquid` are active after the PDP in the template.
- `product-block.liquid`, `product-block-02.liquid`, `product-block-vertical.liquid`, `product-tab-block.liquid`, `spotlight-products.liquid`, `custom-product-widget.liquid`, and `featured-product-unsymmetrical.liquid` are product merchandising/listing sections.

### Product-detail snippets

- The `product-page*.liquid` family contains the main PDP markup for each layout. These are large, closely related implementations with repeated gallery, media, form, tab, sticky-cart, metafield, and sidebar logic.
- `product-button.liquid`, `product-quantity.liquid`, `product-variant.liquid`, `product-variant-picker.liquid`, `price.liquid`, `product-title.liquid`, `product-info.liquid`, `product-perks.liquid`, `product-pickup-availability.liquid`, and `product-vendor.liquid` are reusable buy-box building blocks.
- `halo-sticky-add-to-cart.liquid` and `sticky-add-to-cart.js` implement the active sticky buy box. It includes product identity, variant selection, quantity, price, availability, form submission, and optional vendor/wishlist behavior.
- `halo-product-tab.liquid` renders description and custom tabs. It reads custom fields from the `c_f` and `custom` namespaces; rich text now renders through `metafield_tag`.
- `product-bundle.liquid`, `product-bundle-item.liquid`, `combined-products-listing.liquid`, `product-combo-item.liquid`, and their supporting scripts implement product bundle/combo behavior.
- `aura-product-gallery.liquid`, `aura-product-gallery.css`, and `aura-product-gallery.js` are the active native cinematic gallery implementation.

### Product metafields in use

The product stack reads legacy `c_f` metafields for size charts, product combinations, grouped sub-products, bundle discounts, property/variant descriptions, and some dynamic tab sources. It also supports the `custom` namespace for product tabs, including the active `custom.fabric_story` and `custom.craftsmanship` fields.

## 4. CSS and JavaScript architecture

### CSS

- `global-style.liquid` always loads `base.css`, `animated.css`, card/loading/quick-cart CSS, and conditionally loads custom CSS, RTL CSS, hover animation CSS, card-layout CSS, and optional component styles.
- `vendor.css` is deferred using the print-media swap pattern, with a noscript fallback.
- Product sections load their own core product CSS synchronously: `component-product.css`, `component-price.css`, `component-badge.css`, `component-rte.css`, `component-share.css`, `component-tab.css`, `component-product-form.css`, and `component-grid.css`.
- Several features inject inline style blocks or hold CSS directly in `custom_liquid` settings. The active product template contains a custom-liquid trust-message block with inline CSS.

### JavaScript

- `global-script.liquid` loads `vendor.js`, `global.js`, and `lazysizes.min.js` without `defer`; it conditionally loads predictive search and animation scripts with `defer`.
- `global-script-2.liquid` defers `slider.js` and `theme.js`, plus free-shipping behavior when enabled.
- `theme.js` is a broad, jQuery/Slick-oriented runtime. It initializes product galleries, product grids, quick shop, video behavior, variant-gallery filtering, and other unrelated features.
- The product page conditionally adds focused scripts: `variants.js`, `sticky-add-to-cart.js`, `deferred-media.js`, `product-model.js`, `zoomed-image.js`, `fancybox.js`, `gsap.js`, `delivery-time.js`, `product-bundle.js`, and quick-order/complementary-product scripts.
- The active cinematic gallery is standalone vanilla JavaScript. It does not use jQuery, Slick, Fancybox, GSAP, or another third-party gallery runtime.

## 5. Existing app dependencies

- The product schema permits app blocks through a `@app` block declaration in `main-product-gallery.liquid`.
- `templates/product.json` includes one `apps` section (`1747659282db7dcf67`), but it has no configured blocks. No concrete product-template app block is present in the repository configuration.
- `content_for_header` can still inject Shopify or installed-app assets at runtime; its actual contents are not stored in the theme repository and cannot be audited here.
- The current settings select `share_product_type: addthis`, and `theme.js` contains AddThis-specific handling. This is an optional third-party integration path, although no AddThis script URL is hardcoded in the checked product template.
- The template also has active custom-Liquid content linking to WhatsApp and Shopify-hosted image files. These are merchant-configured content dependencies, not app blocks.

## 6. Performance risks

1. **Large global baseline.** `vendor.js`, `global.js`, `lazysizes.min.js`, `slider.js`, and the large `theme.js` runtime load site-wide. `theme.js` includes broad Slick initialization logic, including legacy product-gallery behavior.
2. **Render-blocking head scripts.** `global-script.liquid` uses `script_tag` for `vendor.js`, `global.js`, and `lazysizes.min.js`, so they are not explicitly deferred. `layout/theme.liquid` also uses `script_tag` for optional `custom.js`.
3. **Duplicated PDP implementations.** The large `product-page*.liquid` variants repeat most product markup and feature loading. Fixes or performance improvements must be made across multiple copies, increasing the chance of drift.
4. **Legacy product-gallery stack remains in the codebase.** Slick, Fancybox, GSAP, custom cursor, zoom, and video/gallery logic remain available for legacy gallery paths. The active cinematic path avoids these libraries, but the shared global runtime still includes Slick support.
5. **Inline CSS and custom Liquid.** The active product template includes inline CSS and externally hosted trust images inside custom Liquid. This bypasses asset consolidation and makes responsive image optimization harder.
6. **External font imports.** `variable.liquid` uses Google Fonts `@import` for configured fonts. This can delay font discovery compared with optimized `<link>` loading and relies on an external origin.
7. **Unconditional product CSS.** The active main-product section synchronously requests eight core component stylesheets before its markup. Some may not be necessary for every configured block.
8. **Product media duplication risk.** Legacy gallery markup uses master-sized image URLs in places. The active cinematic gallery uses Shopify responsive `image_url`/`image_tag` rendering, but the legacy layout paths retain older image behavior.

## 7. Accessibility risks

1. **Custom Liquid is ungoverned.** Active trust content has empty image `alt` attributes and hardcoded English text. Other disabled custom-Liquid blocks include inline styles, hardcoded contact details, and malformed HTML (`</p5>`), so enabling them can regress semantics.
2. **Legacy gallery controls.** The old product gallery is jQuery/Slick/Fancybox-based. Its accessibility needs separate validation for focus order, slide announcements, zoom, modal focus trapping, and video controls. The active cinematic gallery has keyboard navigation, labeled thumbnail controls, focus styles, and live counter updates.
3. **Translation coverage.** The repository includes many locale files and some Theme Check translation errors. Schema labels and some merchant-configured custom content are English-only.
4. **Color configuration.** The active product JSON contains many direct color values, and inline/custom CSS uses hardcoded colors. This conflicts with the project rule to avoid hardcoded colors and makes contrast governance harder.
5. **Interactive complexity.** The sticky buy box, variant selector, dynamic payment controls, popup tabs, product media, size chart, compare-color controls, and optional quick-order list create multiple keyboard/focus paths that require regression testing together.

## 8. Reusable components

- Buy-box primitives: `price`, `product-button`, `product-quantity`, `product-variant`, `product-variant-picker`, `product-info`, `product-title`, and `product-perks`.
- Product storytelling: `halo-product-tab` plus metafield-backed custom blocks for Fabric Story and Craftsmanship.
- Commerce behavior: `halo-sticky-add-to-cart`, `product-pickup-availability`, `product-bundle`, and product recommendations/recently viewed sections.
- Product media: the active `aura-product-gallery` is scoped, responsive, native, and Theme Editor configurable.
- Shared platform facilities: section blocks, product metafields, native product forms, dynamic checkout, Shopify media types, localized translation keys, and OS 2.0 app-block support.

## 9. Components that should be replaced or consolidated

1. **Consolidate the repeated `product-page*.liquid` implementations.** Establish one canonical PDP composition with small, layout-specific wrappers instead of duplicating the full media, buy-box, tabs, and script-loading pipeline across seven files.
2. **Retire legacy product media paths once parity is confirmed.** The Slick/Fancybox/GSAP/custom-cursor gallery implementations should be removed or isolated after the active native gallery is validated across image, video, external-video, and 3D-model products.
3. **Replace active product-template custom Liquid with typed section blocks.** The trust-message/customization content should become translatable blocks with image pickers, alt text, and schema-controlled spacing. The disabled custom-Liquid blocks should not be treated as reusable product features.
4. **Replace legacy `c_f` string conventions with typed `custom` metafield definitions.** Preserve compatibility during migration, but define clear types for fabric story, craftsmanship, size chart, product bundles, and structured product properties.
5. **Split the global runtime by feature.** Keep only minimal shared behavior in the global entry point; conditionally load gallery, slider, quick-shop, and product-form code where the corresponding component is rendered.

## 10. Recommended first implementation milestone

### Milestone: Canonical PDP foundation and regression baseline

Before adding new visual product features, standardize the active product page around `main-product-gallery` and its active native gallery.

Deliverables:

1. Define the supported product data contract in Shopify Admin: `custom.fabric_story`, `custom.craftsmanship`, typed size-chart data, and any required bundle/property metafields.
2. Replace active custom-Liquid trust/customization content with schema-backed, translatable product blocks that use native image pickers and alt text.
3. Create a PDP regression matrix covering simple, multi-variant, sold-out, video, 3D, rich-text-metafield, and bundle products across desktop, mobile, keyboard-only, and screen-reader flows.
4. Record baseline Core Web Vitals and network payloads for the current product page. Then identify which legacy gallery/runtime assets can be excluded from the active path.
5. Do not remove alternate PDP layouts until the canonical section has feature parity and the regression matrix passes.

This milestone directly supports the Project AURA requirements: native Shopify editing, localization, metafield-driven content, performance-first implementation, and accessibility-first delivery.
