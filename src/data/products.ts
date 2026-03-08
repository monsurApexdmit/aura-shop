import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";
import product7 from "@/assets/product-7.jpg";
import product8 from "@/assets/product-8.jpg";

export interface ProductVariant {
  id: string;
  name: string;
  attributes: Record<string, string>;
  price: number;
  salePrice?: number;
  stock: number;
  sku: string;
}

export interface ProductAttribute {
  name: string;
  displayName: string;
  values: string[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  subcategory: string;
  badge?: string;
  rating: number;
  reviews: number;
  sku?: string;
  stock?: number;
  attributes?: ProductAttribute[];
  variants?: ProductVariant[];
  description?: string;
}

const imgs = [product1, product2, product3, product4, product5, product6, product7, product8];
const img = (i: number) => imgs[i % imgs.length];

export const products: Product[] = [
  // Electronics
  { id: "1", name: "Wireless Headphones Pro Max", price: 129.99, originalPrice: 179.99, image: img(0), images: [img(0), img(1), img(2), img(3)], category: "Electronics", subcategory: "Headphones & Audio", badge: "Hot Deal", rating: 4.8, reviews: 342, sku: "WHP-BLK-001", stock: 25,
    description: "Experience immersive sound with our premium wireless headphones featuring active noise cancellation, 40-hour battery life, and ultra-comfortable memory foam ear cushions.",
    attributes: [
      { name: "color", displayName: "Color", values: ["Black", "White", "Navy"] },
      { name: "connectivity", displayName: "Connectivity", values: ["Bluetooth 5.3", "Wired + Bluetooth"] },
    ],
    variants: [
      { id: "v1-1", name: "Black / Bluetooth 5.3", attributes: { Color: "Black", Connectivity: "Bluetooth 5.3" }, price: 129.99, salePrice: 129.99, stock: 10, sku: "WHP-BLK-BT" },
      { id: "v1-2", name: "White / Bluetooth 5.3", attributes: { Color: "White", Connectivity: "Bluetooth 5.3" }, price: 129.99, salePrice: 129.99, stock: 8, sku: "WHP-WHT-BT" },
      { id: "v1-3", name: "Navy / Wired + Bluetooth", attributes: { Color: "Navy", Connectivity: "Wired + Bluetooth" }, price: 149.99, salePrice: 139.99, stock: 5, sku: "WHP-NAV-WB" },
      { id: "v1-4", name: "Black / Wired + Bluetooth", attributes: { Color: "Black", Connectivity: "Wired + Bluetooth" }, price: 149.99, salePrice: 139.99, stock: 2, sku: "WHP-BLK-WB" },
    ],
  },
  { id: "4", name: "Smart Watch Elite Series", price: 249.99, originalPrice: 299.99, image: img(3), images: [img(3), img(0), img(4), img(7)], category: "Electronics", subcategory: "Smartphones", badge: "Best Seller", rating: 4.6, reviews: 567, sku: "SW-ELT-001", stock: 40,
    description: "Track your fitness goals and stay connected with the Smart Watch Elite. Features heart rate monitoring, GPS, sleep tracking, and a stunning AMOLED display.",
    attributes: [
      { name: "color", displayName: "Color", values: ["Midnight Black", "Silver", "Rose Gold"] },
      { name: "size", displayName: "Size", values: ["40mm", "44mm"] },
    ],
    variants: [
      { id: "v4-1", name: "Midnight Black / 40mm", attributes: { Color: "Midnight Black", Size: "40mm" }, price: 249.99, salePrice: 249.99, stock: 12, sku: "SW-BLK-40" },
      { id: "v4-2", name: "Silver / 44mm", attributes: { Color: "Silver", Size: "44mm" }, price: 269.99, salePrice: 259.99, stock: 8, sku: "SW-SLV-44" },
      { id: "v4-3", name: "Rose Gold / 40mm", attributes: { Color: "Rose Gold", Size: "40mm" }, price: 259.99, salePrice: 249.99, stock: 6, sku: "SW-RG-40" },
    ],
  },
  { id: "e1", name: "USB-C Hub Adapter 7-in-1", price: 39.99, image: img(0), category: "Electronics", subcategory: "Accessories", rating: 4.5, reviews: 210 },
  { id: "e2", name: "Bluetooth Portable Speaker", price: 59.99, originalPrice: 79.99, image: img(3), category: "Electronics", subcategory: "Headphones & Audio", badge: "Sale", rating: 4.7, reviews: 185 },
  { id: "e3", name: "Mirrorless Camera Kit", price: 899.99, image: img(0), category: "Electronics", subcategory: "Cameras & Photography", rating: 4.9, reviews: 78 },
  { id: "e4", name: "Wireless Charging Pad", price: 24.99, image: img(3), category: "Electronics", subcategory: "Accessories", rating: 4.3, reviews: 430 },
  { id: "e5", name: "Noise Cancelling Earbuds", price: 79.99, originalPrice: 99.99, image: img(0), category: "Electronics", subcategory: "Headphones & Audio", badge: "New", rating: 4.8, reviews: 156 },
  { id: "e6", name: "Gaming Laptop 15.6\"", price: 1199.99, originalPrice: 1399.99, image: img(3), category: "Electronics", subcategory: "Laptops & Tablets", badge: "Hot Deal", rating: 4.7, reviews: 92 },

  // Fashion & Apparel
  { id: "3", name: "Heritage Leather Backpack", price: 89.99, image: img(2), category: "Fashion & Apparel", subcategory: "Men's Clothing", rating: 4.7, reviews: 89 },
  { id: "7", name: "Classic Amber Sunglasses", price: 59.99, originalPrice: 79.99, image: img(6), category: "Fashion & Apparel", subcategory: "Watches & Jewelry", rating: 4.4, reviews: 167 },
  { id: "f1", name: "Slim Fit Denim Jeans", price: 49.99, image: img(2), category: "Fashion & Apparel", subcategory: "Men's Clothing", rating: 4.5, reviews: 320 },
  { id: "f2", name: "Floral Maxi Summer Dress", price: 64.99, originalPrice: 84.99, image: img(6), category: "Fashion & Apparel", subcategory: "Women's Clothing", badge: "Trending", rating: 4.8, reviews: 245 },
  { id: "f3", name: "Kids Rainbow Hoodie", price: 29.99, image: img(2), category: "Fashion & Apparel", subcategory: "Kids' Wear", rating: 4.6, reviews: 178 },
  { id: "f4", name: "Leather Ankle Boots", price: 109.99, image: img(6), category: "Fashion & Apparel", subcategory: "Shoes & Footwear", rating: 4.7, reviews: 134 },
  { id: "f5", name: "Rose Gold Watch", price: 189.99, originalPrice: 239.99, image: img(2), category: "Fashion & Apparel", subcategory: "Watches & Jewelry", badge: "Premium", rating: 4.9, reviews: 67 },

  // Beauty & Skincare
  { id: "2", name: "Vitamin C Brightening Serum", price: 34.99, image: img(1), category: "Beauty & Skincare", subcategory: "Skincare", badge: "New", rating: 4.9, reviews: 128 },
  { id: "b1", name: "Hydrating Face Moisturizer", price: 28.99, image: img(1), category: "Beauty & Skincare", subcategory: "Skincare", rating: 4.7, reviews: 356 },
  { id: "b2", name: "Matte Lipstick Collection", price: 19.99, image: img(1), category: "Beauty & Skincare", subcategory: "Makeup", rating: 4.6, reviews: 289 },
  { id: "b3", name: "Keratin Hair Treatment", price: 42.99, originalPrice: 55.99, image: img(1), category: "Beauty & Skincare", subcategory: "Hair Care", badge: "Sale", rating: 4.5, reviews: 145 },
  { id: "b4", name: "Eau de Parfum Luxe", price: 89.99, image: img(1), category: "Beauty & Skincare", subcategory: "Fragrance", rating: 4.8, reviews: 203 },

  // Grocery & Food
  { id: "6", name: "Organic Green Tea Premium", price: 14.99, image: img(5), category: "Grocery & Food", subcategory: "Snacks & Beverages", badge: "Organic", rating: 4.8, reviews: 456 },
  { id: "g1", name: "Mixed Nuts Trail Pack", price: 9.99, image: img(5), category: "Grocery & Food", subcategory: "Snacks & Beverages", rating: 4.6, reviews: 520 },
  { id: "g2", name: "Artisan Sourdough Bread", price: 6.99, image: img(5), category: "Grocery & Food", subcategory: "Bakery & Bread", rating: 4.7, reviews: 178 },
  { id: "g3", name: "Organic Fresh Milk 1L", price: 4.99, image: img(5), category: "Grocery & Food", subcategory: "Dairy & Eggs", rating: 4.5, reviews: 890 },
  { id: "g4", name: "Extra Virgin Olive Oil", price: 12.99, image: img(5), category: "Grocery & Food", subcategory: "Pantry Staples", rating: 4.8, reviews: 345 },
  { id: "g5", name: "Fresh Seasonal Fruit Box", price: 24.99, image: img(5), category: "Grocery & Food", subcategory: "Fresh Fruits & Vegetables", badge: "Fresh", rating: 4.9, reviews: 234 },

  // Home & Kitchen
  { id: "8", name: "Soy Wax Vanilla Candle Set", price: 24.99, image: img(7), category: "Home & Kitchen", subcategory: "Home Decor", rating: 4.7, reviews: 312 },
  { id: "h1", name: "Ergonomic Office Chair", price: 299.99, originalPrice: 399.99, image: img(7), category: "Home & Kitchen", subcategory: "Furniture", badge: "Sale", rating: 4.6, reviews: 145 },
  { id: "h2", name: "Air Fryer XL 5.5L", price: 89.99, image: img(7), category: "Home & Kitchen", subcategory: "Kitchen Appliances", rating: 4.8, reviews: 567 },
  { id: "h3", name: "Egyptian Cotton Sheet Set", price: 69.99, image: img(7), category: "Home & Kitchen", subcategory: "Bedding & Bath", rating: 4.7, reviews: 234 },
  { id: "h4", name: "Modern Pendant Light", price: 54.99, image: img(7), category: "Home & Kitchen", subcategory: "Lighting", rating: 4.5, reviews: 98 },

  // Sports & Outdoors
  { id: "5", name: "AeroFlex Running Shoes", price: 119.99, image: img(4), category: "Sports & Outdoors", subcategory: "Sportswear", rating: 4.5, reviews: 234 },
  { id: "s1", name: "Adjustable Dumbbell Set", price: 149.99, image: img(4), category: "Sports & Outdoors", subcategory: "Gym Equipment", rating: 4.7, reviews: 312 },
  { id: "s2", name: "Hiking Backpack 60L", price: 79.99, originalPrice: 99.99, image: img(4), category: "Sports & Outdoors", subcategory: "Outdoor Gear", badge: "Sale", rating: 4.6, reviews: 189 },
  { id: "s3", name: "Carbon Fiber Road Bike", price: 899.99, image: img(4), category: "Sports & Outdoors", subcategory: "Cycling", rating: 4.9, reviews: 45 },
  { id: "s4", name: "4-Person Camping Tent", price: 129.99, image: img(4), category: "Sports & Outdoors", subcategory: "Camping", rating: 4.5, reviews: 267 },

  // Health & Medicine
  { id: "m1", name: "Multivitamin Complex 90ct", price: 19.99, image: img(1), category: "Health & Medicine", subcategory: "Vitamins & Supplements", rating: 4.7, reviews: 678 },
  { id: "m2", name: "First Aid Kit Premium", price: 34.99, image: img(1), category: "Health & Medicine", subcategory: "First Aid & Safety", rating: 4.8, reviews: 234 },
  { id: "m3", name: "Digital Blood Pressure Monitor", price: 49.99, originalPrice: 69.99, image: img(1), category: "Health & Medicine", subcategory: "Medical Devices", badge: "Sale", rating: 4.6, reviews: 345 },
  { id: "m4", name: "Collagen Peptides Powder", price: 29.99, image: img(1), category: "Health & Medicine", subcategory: "Wellness & Fitness", rating: 4.5, reviews: 456 },
  { id: "m5", name: "Electric Toothbrush Pro", price: 44.99, image: img(1), category: "Health & Medicine", subcategory: "Personal Care", rating: 4.7, reviews: 567 },

  // Gaming
  { id: "gm1", name: "Wireless Gaming Mouse", price: 69.99, originalPrice: 89.99, image: img(3), category: "Gaming", subcategory: "Gaming Accessories", badge: "Hot", rating: 4.8, reviews: 890 },
  { id: "gm2", name: "Mechanical RGB Keyboard", price: 109.99, image: img(3), category: "Gaming", subcategory: "PC Gaming", rating: 4.7, reviews: 456 },
  { id: "gm3", name: "VR Headset Pro", price: 399.99, image: img(3), category: "Gaming", subcategory: "VR & AR", rating: 4.6, reviews: 123 },
  { id: "gm4", name: "Console Controller Dual", price: 59.99, image: img(3), category: "Gaming", subcategory: "Consoles", rating: 4.5, reviews: 789 },
];
