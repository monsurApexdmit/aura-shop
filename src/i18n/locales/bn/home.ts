import type { Messages } from "../../types";
import type en from "../en/home";

// বাংলা — "home" namespace. Must have exactly the keys of ../en/home.ts.
const bn: Messages<typeof en> = {
  shopName: "{{name}} কিনুন",
  announcement: {
    label: "স্টোরের ঘোষণা",
    coupon: "কোড {{code}}: {{offer}}",
    couponMin: "কোড {{code}}: {{amount}}-এর বেশি অর্ডারে {{offer}}",
  },
  coupons: {
    title: "আপনার জন্য অফার",
    tapToCopy: "কপি করতে ট্যাপ করুন",
    copyHint: "কোড কপি করে চেকআউটে ব্যবহার করুন",
    freeShipping: "ফ্রি ডেলিভারি",
    minOrder: "{{amount}}-এর বেশি অর্ডারে",
    noMinimum: "সর্বনিম্ন অর্ডারের শর্ত নেই",
    copyCode: "{{code}} কোড কপি করুন",
  },
  features: {
    label: "স্টোরের সুবিধা",
    delivery: "ঘরে বসে ডেলিভারি",
    deliveryText: "ডেলিভারি এলাকা, চার্জ ও সময় দেখুন।",
    returns: "রিটার্ন ও এক্সচেঞ্জ",
    returnsText: "কী রিটার্ন করা যায় এবং কীভাবে, দেখুন।",
    secure: "নিরাপদ চেকআউট",
    payWith: "{{methods}} দিয়ে পেমেন্ট করুন।",
    secureText: "আপনার পেমেন্টের তথ্য সুরক্ষিত থাকে।",
  },
  storeHours: {
    closedToday: "ছুটির কারণে আজ আমাদের স্টোর বন্ধ। এখন অর্ডার করলে স্টোর খোলার পর প্রসেস করা হবে।",
    closingSoon: "জানিয়ে রাখি: {{date}} তারিখে আমাদের স্টোর বন্ধ থাকবে।",
    title: "খোলার সময়",
    closedTodayShort: "আজ বন্ধ (ছুটি)",
    nextClosure: "পরবর্তী বন্ধ: {{date}}",
  },
  aisles: {
    title: "আপনার বিভাগ বেছে নিন",
    subtitle_one: "{{word}} বিভাগ, এক পোশাক-ভাবনা।",
    subtitle_other: "{{word}} বিভাগ, এক পোশাক-ভাবনা।",
    numbers: {
      one: "একটি",
      two: "দুটি",
      three: "তিনটি",
      four: "চারটি",
      five: "পাঁচটি",
      six: "ছয়টি",
    },
    tagline: {
      women: "কোমল শক্তি, উজ্জ্বল রং।",
      men: "আরামদায়ক কাট, রোদেলা রং।",
      kids: "লাফ, ঘোরাঘুরি আর দৌড়ঝাঁপের জন্য তৈরি।",
    },
    shopAll: "সব {{name}} দেখুন",
    explore: "দেখুন",
    everyAisle: "সব<br/><em>বিভাগ</em> →",
  },
  hero: {
    tag: "নতুন সিজন চলে এসেছে",
    title: "পরুন\n*খুশির* রং।",
    subtitle: "নারী, পুরুষ আর ছোটদের জন্য রঙিন পোশাক।",
    cta: "নতুন কালেকশন দেখুন",
    newSeason: "নতুন সিজন",
    carousel: "ক্যারোসেল",
    chooseSlide: "স্লাইড বেছে নিন",
    showSlide: "স্লাইড {{number}} দেখুন: {{title}}",
  },
  collections: {
    title: "কালেকশন অনুযায়ী কিনুন",
    subtitle: "বাছাই করা কালেকশন, নিয়মিত নতুন।",
    all: "সব কালেকশন",
  },
  products: {
    title: "এই সপ্তাহের বাছাই",
    subtitle: "নতুন পণ্য, মন থেকে বাছাই করা।",
    shopAll: "সব দেখুন",
    empty: "এখানে এখনো কোনো পণ্য নেই।",
  },
  lookbook: {
    tag: "লুকবুক",
    title: "সারা বছর *রঙিন*, কোনো দ্বিধা নেই।",
    text: "উজ্জ্বল রং, আরামদায়ক কাট আর পুরো পরিবারের জন্য পোশাক। পুরো কালেকশনে খুঁজে নিন আপনার পরবর্তী প্রিয়টি।",
    cta: "কালেকশন দেখুন",
    spotlightTag: "স্পটলাইট",
    spotlightTitle: "*{{name}}*-এ নতুন এসেছে।",
    spotlightTextSubs: "{{subs}} এবং আরও: আমাদের {{name}} কালেকশনে নতুন পণ্য।",
    spotlightText: "আমাদের {{name}} কালেকশনে নতুন পণ্য, আপনার জন্য বাছাই করা।",
  },
  backToTop: "উপরে যান",
};

export default bn;
