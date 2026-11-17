import type { Messages } from "../../types";
import type en from "../en/chat";

// বাংলা — "chat" namespace. Must have exactly the keys of ../en/chat.ts.
const bn: Messages<typeof en> = {
  open: "চ্যাট খুলুন",
  header: {
    title: "কাস্টমার সাপোর্ট",
    connecting: "সংযোগ হচ্ছে…",
    replyTime: "আমরা সাধারণত সাথে সাথেই উত্তর দিই",
    openFull: "পুরো সাপোর্ট পেজ খুলুন",
    minimize: "চ্যাট ছোট করুন",
    close: "চ্যাট বন্ধ করুন",
  },
  welcome: "হ্যালো! 👋 {{store}}-এ আপনাকে স্বাগতম। আজ কীভাবে সাহায্য করতে পারি?",
  agent: "সাপোর্ট এজেন্ট",
  newRequest: "নতুন সাপোর্ট অনুরোধ",
  guest: {
    intro: "সংযোগের আগে আপনার নাম ও ইমেইল দিন, যাতে আমাদের টিম আপনার সাথে যোগাযোগ রাখতে পারে।",
    name: "আপনার নাম",
    email: "আপনার ইমেইল",
    message: "বার্তা: \"{{text}}\"",
    start: "চ্যাট শুরু করুন",
  },
  quick: {
    track: "আমার অর্ডার ট্র্যাক করুন",
    trackSubject: "আমার অর্ডার ট্র্যাক করতে চাই",
    returns: "রিটার্ন পলিসি",
    returnsSubject: "রিটার্ন পলিসি",
    payment: "পেমেন্ট সমস্যা",
    paymentSubject: "পেমেন্ট সমস্যা",
    agent: "এজেন্টের সাথে কথা বলুন",
    agentSubject: "একজন এজেন্টের সাথে কথা বলতে চাই",
  },
  system: {
    resolved: "এই কথোপকথনটি সমাধান হয়েছে। ধন্যবাদ! 🎉",
    startFailed: "চ্যাট শুরু করা যায়নি। আবার চেষ্টা করুন।",
    sendFailed: "পাঠানো যায়নি। আবার চেষ্টা করুন।",
    micFailed: "মাইক্রোফোন চালু করা যায়নি। মাইক্রোফোনের অনুমতি দিয়ে আবার চেষ্টা করুন।",
  },
  resolved: {
    title: "টিকিট সমাধান হয়েছে",
    newChat: "নতুন কথোপকথন শুরু করুন",
  },
  input: {
    attach: "ফাইল যুক্ত করুন",
    record: "ভয়েস নোট রেকর্ড করুন",
    stop: "রেকর্ডিং বন্ধ করুন",
    placeholderStart: "কথোপকথন শুরু করতে লিখুন…",
    placeholder: "বার্তা লিখুন…",
    send: "বার্তা পাঠান",
    hint: "সর্বোচ্চ {{max}}টি ফাইল যুক্ত করুন অথবা ভয়েস নোট রেকর্ড করুন।",
  },
  attachments: {
    open: "খুলুন",
    remove: "{{name}} সরান",
  },
};

export default bn;
