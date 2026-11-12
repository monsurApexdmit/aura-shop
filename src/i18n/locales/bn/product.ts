import type { Messages } from "../../types";
import type en from "../en/product";

// বাংলা — "product" namespace. Must have exactly the keys of ../en/product.ts.
const bn: Messages<typeof en> = {
  reviews: {
    basedOn_one: "{{count}}টি রিভিউয়ের ভিত্তিতে",
    basedOn_other: "{{count}}টি রিভিউয়ের ভিত্তিতে",
    writeTitle: "রিভিউ লিখুন",
    updateTitle: "আপনার রিভিউ আপডেট করুন",
    descSignedIn: "এই পণ্য নিয়ে আপনার অভিজ্ঞতা শেয়ার করুন।",
    descSignedOut: "এই পণ্যের রিভিউ দিতে সাইন ইন করুন।",
    rate_one: "{{count}} স্টার দিন",
    rate_other: "{{count}} স্টার দিন",
    placeholder: "পণ্যটির কী ভালো লেগেছে বা কী ভালো লাগেনি, অন্য ক্রেতাদের জানান।",
    signInToWrite: "রিভিউ লিখতে সাইন ইন করুন",
    appearsImmediately: "আপনার রিভিউ সাথে সাথেই এই পণ্যে দেখা যাবে।",
    submit: "রিভিউ জমা দিন",
    update: "রিভিউ আপডেট করুন",
    loading: "রিভিউ লোড হচ্ছে...",
    emptyTitle: "এখনো কোনো রিভিউ নেই",
    emptyText: "এই পণ্য নিয়ে প্রথম রিভিউটি আপনিই দিন।",
    toast: {
      signIn: "রিভিউ লিখতে অনুগ্রহ করে সাইন ইন করুন।",
      minLength: "অনুগ্রহ করে অন্তত {{min}} অক্ষর লিখুন।",
      updated: "রিভিউ আপডেট হয়েছে।",
      submitted: "রিভিউ জমা হয়েছে।",
      failed: "রিভিউ সংরক্ষণ করা যায়নি।",
    },
  },
  reviewCard: {
    verified: "যাচাইকৃত ক্রেতা",
    today: "আজ",
    yesterday: "গতকাল",
    daysAgo_one: "{{count}} দিন আগে",
    daysAgo_other: "{{count}} দিন আগে",
    weeksAgo_one: "{{count}} সপ্তাহ আগে",
    weeksAgo_other: "{{count}} সপ্তাহ আগে",
    monthsAgo_one: "{{count}} মাস আগে",
    monthsAgo_other: "{{count}} মাস আগে",
    yearsAgo_one: "{{count}} বছর আগে",
    yearsAgo_other: "{{count}} বছর আগে",
    helpful: "উপকারী?",
    yes: "হ্যাঁ",
    no: "না",
  },
  quickActions: {
    viewDetails: "পণ্যের বিস্তারিত দেখুন",
  },
  page: {
    skuNone: "প্রযোজ্য নয়",
    linkCopied: "লিংক কপি হয়েছে",
    whatsAppOrder: "হ্যালো, আমি অর্ডার করতে চাই: {{product}}{{variant}} — {{price}}\n{{url}}",
  },
};

export default bn;
