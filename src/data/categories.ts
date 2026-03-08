import { Monitor, Shirt, Pill, ShoppingBasket, Home, Sparkles, Dumbbell, BookOpen, Baby, Coffee, Wrench, Gamepad2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface SubCategory {
  name: string;
  slug: string;
}

export interface Category {
  name: string;
  slug: string;
  icon: LucideIcon;
  children: SubCategory[];
}

export const categories: Category[] = [
  {
    name: "Electronics",
    slug: "electronics",
    icon: Monitor,
    children: [
      { name: "Smartphones", slug: "smartphones" },
      { name: "Laptops & Tablets", slug: "laptops-tablets" },
      { name: "Headphones & Audio", slug: "headphones-audio" },
      { name: "Cameras & Photography", slug: "cameras" },
      { name: "Accessories", slug: "electronics-accessories" },
    ],
  },
  {
    name: "Fashion & Apparel",
    slug: "fashion",
    icon: Shirt,
    children: [
      { name: "Men's Clothing", slug: "mens-clothing" },
      { name: "Women's Clothing", slug: "womens-clothing" },
      { name: "Kids' Wear", slug: "kids-wear" },
      { name: "Shoes & Footwear", slug: "shoes" },
      { name: "Watches & Jewelry", slug: "watches-jewelry" },
    ],
  },
  {
    name: "Health & Medicine",
    slug: "health-medicine",
    icon: Pill,
    children: [
      { name: "Vitamins & Supplements", slug: "vitamins" },
      { name: "First Aid & Safety", slug: "first-aid" },
      { name: "Personal Care", slug: "personal-care" },
      { name: "Medical Devices", slug: "medical-devices" },
      { name: "Wellness & Fitness", slug: "wellness" },
    ],
  },
  {
    name: "Grocery & Food",
    slug: "grocery",
    icon: ShoppingBasket,
    children: [
      { name: "Fresh Fruits & Vegetables", slug: "fresh-produce" },
      { name: "Dairy & Eggs", slug: "dairy-eggs" },
      { name: "Bakery & Bread", slug: "bakery" },
      { name: "Snacks & Beverages", slug: "snacks-beverages" },
      { name: "Pantry Staples", slug: "pantry" },
    ],
  },
  {
    name: "Home & Kitchen",
    slug: "home-kitchen",
    icon: Home,
    children: [
      { name: "Furniture", slug: "furniture" },
      { name: "Kitchen Appliances", slug: "kitchen-appliances" },
      { name: "Home Decor", slug: "home-decor" },
      { name: "Bedding & Bath", slug: "bedding-bath" },
      { name: "Lighting", slug: "lighting" },
    ],
  },
  {
    name: "Beauty & Skincare",
    slug: "beauty",
    icon: Sparkles,
    children: [
      { name: "Skincare", slug: "skincare" },
      { name: "Makeup", slug: "makeup" },
      { name: "Hair Care", slug: "hair-care" },
      { name: "Fragrance", slug: "fragrance" },
      { name: "Nail Care", slug: "nail-care" },
    ],
  },
  {
    name: "Sports & Outdoors",
    slug: "sports",
    icon: Dumbbell,
    children: [
      { name: "Gym Equipment", slug: "gym-equipment" },
      { name: "Outdoor Gear", slug: "outdoor-gear" },
      { name: "Sportswear", slug: "sportswear" },
      { name: "Cycling", slug: "cycling" },
      { name: "Camping", slug: "camping" },
    ],
  },
  {
    name: "Books & Stationery",
    slug: "books",
    icon: BookOpen,
    children: [
      { name: "Fiction", slug: "fiction" },
      { name: "Non-Fiction", slug: "non-fiction" },
      { name: "Educational", slug: "educational" },
      { name: "Office Supplies", slug: "office-supplies" },
      { name: "Art Supplies", slug: "art-supplies" },
    ],
  },
  {
    name: "Baby & Kids",
    slug: "baby-kids",
    icon: Baby,
    children: [
      { name: "Baby Food", slug: "baby-food" },
      { name: "Diapers & Wipes", slug: "diapers" },
      { name: "Toys & Games", slug: "toys" },
      { name: "Kids' Clothing", slug: "kids-clothing" },
      { name: "Strollers & Gear", slug: "strollers" },
    ],
  },
  {
    name: "Beverages",
    slug: "beverages",
    icon: Coffee,
    children: [
      { name: "Tea", slug: "tea" },
      { name: "Coffee", slug: "coffee" },
      { name: "Juices & Smoothies", slug: "juices" },
      { name: "Energy Drinks", slug: "energy-drinks" },
      { name: "Water & Soda", slug: "water-soda" },
    ],
  },
  {
    name: "Tools & Hardware",
    slug: "tools",
    icon: Wrench,
    children: [
      { name: "Power Tools", slug: "power-tools" },
      { name: "Hand Tools", slug: "hand-tools" },
      { name: "Electrical", slug: "electrical" },
      { name: "Plumbing", slug: "plumbing" },
      { name: "Safety Equipment", slug: "safety-equipment" },
    ],
  },
  {
    name: "Gaming",
    slug: "gaming",
    icon: Gamepad2,
    children: [
      { name: "Consoles", slug: "consoles" },
      { name: "PC Gaming", slug: "pc-gaming" },
      { name: "Gaming Accessories", slug: "gaming-accessories" },
      { name: "Video Games", slug: "video-games" },
      { name: "VR & AR", slug: "vr-ar" },
    ],
  },
];