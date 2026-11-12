import type { Messages } from "../../types";
import type en from "../en/cart";

// বাংলা — "cart" namespace. Must have exactly the keys of ../en/cart.ts.
const bn: Messages<typeof en> = {
  drawer: {
    title: "শপিং কার্ট",
    close: "কার্ট বন্ধ করুন",
    emptyTitle: "আপনার কার্ট খালি",
    emptyText: "মনে হচ্ছে আপনি এখনও কিছু যোগ করেননি।",
    noImage: "ছবি নেই",
    removeItem: "{{name}} সরান",
    checkout: "চেকআউট করুন",
  },
};

export default bn;
