import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Monitor, Shirt, Heart, ShoppingBasket, Home, Sparkles, Dumbbell, BookOpen, Baby, Coffee, Pill, Wrench } from "lucide-react";

const categories = [
  { name: "Electronics", icon: Monitor, items: ["Phones", "Laptops", "Accessories"], color: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400" },
  { name: "Fashion", icon: Shirt, items: ["Men", "Women", "Kids"], color: "bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400" },
  { name: "Health & Medicine", icon: Pill, items: ["Vitamins", "First Aid", "Wellness"], color: "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400" },
  { name: "Grocery & Food", icon: ShoppingBasket, items: ["Fresh", "Packaged", "Beverages"], color: "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400" },
  { name: "Home & Kitchen", icon: Home, items: ["Furniture", "Decor", "Appliances"], color: "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400" },
  { name: "Beauty", icon: Sparkles, items: ["Skincare", "Makeup", "Fragrance"], color: "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400" },
  { name: "Sports", icon: Dumbbell, items: ["Fitness", "Outdoor", "Gear"], color: "bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400" },
  { name: "Books", icon: BookOpen, items: ["Fiction", "Education", "Comics"], color: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400" },
  { name: "Baby & Kids", icon: Baby, items: ["Toys", "Clothing", "Care"], color: "bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400" },
  { name: "Beverages", icon: Coffee, items: ["Tea", "Coffee", "Juices"], color: "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400" },
  { name: "Pet Care", icon: Heart, items: ["Dog", "Cat", "Fish"], color: "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400" },
  { name: "Tools", icon: Wrench, items: ["Hardware", "Electrical", "Plumbing"], color: "bg-slate-50 dark:bg-slate-950/30 text-slate-600 dark:text-slate-400" },
];

export default function CategoryGrid() {
  return (
    <section className="py-10 md:py-16">
      <div className="container">
        <div className="text-center mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-2xl md:text-3xl font-bold text-foreground"
          >
            Featured Categories
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-muted-foreground text-sm mt-2"
          >
            Choose your necessary products from this feature categories.
          </motion.p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              viewport={{ once: true }}
            >
              <Link
                to="/shop"
                className="group block rounded-lg border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all p-4"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${cat.color}`}>
                  <cat.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display font-semibold text-sm text-card-foreground group-hover:text-primary transition-colors mb-1.5">
                  {cat.name}
                </h3>
                <ul className="space-y-0.5">
                  {cat.items.map((item) => (
                    <li key={item} className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
