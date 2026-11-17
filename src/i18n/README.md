# Storefront translations (i18next)

Languages: English (`en`, default/fallback) and Bangla (`bn`).

- The owner sets the store default in admin → Online store → Default language (`onlineStore.language`).
- Shoppers switch with `<LanguageSwitcher />` (`src/components/common/LanguageSwitcher.tsx`); their pick is kept in `localStorage["aura-lang"]` and beats the store default.
- `html[lang]` follows the language. Bangla loads Hind Siliguri and puts it first in the font stack (`src/index.css`).

## Files

```
src/i18n/
  index.ts            init, LANGUAGES, chooseLanguage(), applyStoreDefault(), localeTag()
  resources.ts        lists every namespace for both languages
  locales/en/<ns>.ts  English source strings (plain object, default export)
  locales/bn/<ns>.ts  Bangla, typed Messages<typeof en> so keys must match
  resources.test.ts   en/bn have the same keys, no empty strings, same {{placeholders}}
  keys.test.ts        every t("ns:key") used in src exists in English
```

Namespaces: `common` (shared words: nav, actions, product badges, money, form labels, footer),
`cart`, `checkout`, `account`, `shop`, `product`, `home` (shared home-page blocks in src/components), `chat` (live chat), `support` (help tickets), `pages` (about, contact, policy pages), and one per template: `tpl_editorial`, `tpl_luxe`,
`tpl_market`, `tpl_single`, `tpl_fresh`.

## Rules

1. **Always prefix the namespace**: `t("cart:drawer.title")`, `t("common:actions.addToCart")`.
   `keys.test.ts` fails on unprefixed or unknown keys.
2. `const { t } = useTranslation();` inside the component. No namespace argument needed because every key is prefixed.
3. Reuse `common` before adding a key. Only add to `common` for text shared by several areas.
4. Nest keys by component: `drawer.title`, `drawer.empty`, `summary.total`.
5. Interpolation: `t("common:product.from", { price: formatCurrency(p) })` with `{{price}}` in the string.
   Never build sentences by concatenating translated pieces; word order differs in Bangla.
6. Plurals: define `key_one` and `key_other` and call `t("common:product.items", { count })`.
7. Markup inside a sentence: `<Trans i18nKey="checkout:terms" components={{ link: <Link to="/terms" /> }} />`
   with `"I agree to the <link>terms</link>"`.
8. Module-level constants (arrays of labels, maps) must hold **keys**, not translated text, and be
   translated at render: `{ labelKey: "shop:sort.newest" }` then `t(item.labelKey)`.
9. Dates and numbers: pass `localeTag()` from `@/i18n` to `toLocaleDateString` / `Intl`. Leave `formatCurrency` alone.
10. Do **not** translate: owner content from the API (product names, descriptions, category names,
    store name, admin-entered banners/template content), URLs, emails, brand names, currency codes.
11. Translate `aria-label`, `alt` (when not from data), `placeholder`, `title`, toast messages and
    validation messages, not only visible text.
12. Bangla: natural, short, shop-style Bangla as used by Bangladeshi online stores
    (e.g. "কার্টে যোগ করুন", "অর্ডার করুন", "ডেলিভারি চার্জ"). Common loanwords such as কার্ট, অর্ডার,
    ডেলিভারি, ক্যাটাগরি and অফার are fine. Keep `{{placeholders}}` identical.
