import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import catHealth from "@/assets/cat-health.jpg";
import catFashion from "@/assets/cat-fashion.jpg";
import catGrocery from "@/assets/cat-grocery.jpg";
import catElectronics from "@/assets/cat-electronics.jpg";

const categories = [
  { name: "Health & Medicine", image: catHealth, count: 240 },
  { name: "Fashion & Apparel", image: catFashion, count: 580 },
  { name: "Grocery & Food", image: catGrocery, count: 320 },
  { name: "Electronics", image: catElectronics, count: 190 },
];

export default function CategoryGrid() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-primary font-semibold text-sm uppercase tracking-widest mb-2"
          >
            Browse by Category
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl font-bold text-foreground"
          >
            Shop What You Need
          </motion.h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Link
                to="/shop"
                className="group block relative rounded-2xl overflow-hidden aspect-[4/5] bg-muted"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="font-display font-bold text-lg text-background">{cat.name}</h3>
                  <p className="text-background/70 text-sm">{cat.count}+ products</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
