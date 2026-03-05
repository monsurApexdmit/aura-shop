import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";
import product7 from "@/assets/product-7.jpg";
import product8 from "@/assets/product-8.jpg";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  badge?: string;
  rating: number;
}

export const products: Product[] = [
  { id: "1", name: "Wireless Headphones Pro", price: 129.99, originalPrice: 179.99, image: product1, category: "Electronics", badge: "Sale", rating: 4.8 },
  { id: "2", name: "Vitamin C Glow Serum", price: 34.99, image: product2, category: "Health & Beauty", badge: "New", rating: 4.9 },
  { id: "3", name: "Heritage Leather Backpack", price: 89.99, image: product3, category: "Fashion", rating: 4.7 },
  { id: "4", name: "Smart Watch Elite", price: 249.99, originalPrice: 299.99, image: product4, category: "Electronics", badge: "Best Seller", rating: 4.6 },
  { id: "5", name: "AeroFlex Running Shoes", price: 119.99, image: product5, category: "Fashion", rating: 4.5 },
  { id: "6", name: "Organic Green Tea Premium", price: 14.99, image: product6, category: "Grocery", badge: "Organic", rating: 4.8 },
  { id: "7", name: "Classic Amber Sunglasses", price: 59.99, image: product7, category: "Fashion", rating: 4.4 },
  { id: "8", name: "Soy Wax Vanilla Candle", price: 24.99, image: product8, category: "Home", rating: 4.7 },
];
