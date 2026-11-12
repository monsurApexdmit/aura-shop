// Every namespace, both languages. Add a namespace: create en/<ns>.ts + bn/<ns>.ts and list it here.
import en_common from "./locales/en/common";
import en_cart from "./locales/en/cart";
import en_checkout from "./locales/en/checkout";
import en_account from "./locales/en/account";
import en_shop from "./locales/en/shop";
import en_product from "./locales/en/product";
import en_home from "./locales/en/home";
import en_chat from "./locales/en/chat";
import en_support from "./locales/en/support";
import en_pages from "./locales/en/pages";
import en_tpl_editorial from "./locales/en/tpl_editorial";
import en_tpl_luxe from "./locales/en/tpl_luxe";
import en_tpl_market from "./locales/en/tpl_market";
import en_tpl_single from "./locales/en/tpl_single";
import en_tpl_fresh from "./locales/en/tpl_fresh";
import bn_common from "./locales/bn/common";
import bn_cart from "./locales/bn/cart";
import bn_checkout from "./locales/bn/checkout";
import bn_account from "./locales/bn/account";
import bn_shop from "./locales/bn/shop";
import bn_product from "./locales/bn/product";
import bn_home from "./locales/bn/home";
import bn_chat from "./locales/bn/chat";
import bn_support from "./locales/bn/support";
import bn_pages from "./locales/bn/pages";
import bn_tpl_editorial from "./locales/bn/tpl_editorial";
import bn_tpl_luxe from "./locales/bn/tpl_luxe";
import bn_tpl_market from "./locales/bn/tpl_market";
import bn_tpl_single from "./locales/bn/tpl_single";
import bn_tpl_fresh from "./locales/bn/tpl_fresh";

export const resources = {
  en: {
    common: en_common,
    cart: en_cart,
    checkout: en_checkout,
    account: en_account,
    shop: en_shop,
    product: en_product,
    home: en_home,
    chat: en_chat,
    support: en_support,
    pages: en_pages,
    tpl_editorial: en_tpl_editorial,
    tpl_luxe: en_tpl_luxe,
    tpl_market: en_tpl_market,
    tpl_single: en_tpl_single,
    tpl_fresh: en_tpl_fresh,
  },
  bn: {
    common: bn_common,
    cart: bn_cart,
    checkout: bn_checkout,
    account: bn_account,
    shop: bn_shop,
    product: bn_product,
    home: bn_home,
    chat: bn_chat,
    support: bn_support,
    pages: bn_pages,
    tpl_editorial: bn_tpl_editorial,
    tpl_luxe: bn_tpl_luxe,
    tpl_market: bn_tpl_market,
    tpl_single: bn_tpl_single,
    tpl_fresh: bn_tpl_fresh,
  },
} as const;

export const NAMESPACES = Object.keys(resources.en) as (keyof typeof resources.en)[];
