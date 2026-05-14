"use client";
import React, { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ShoppingCart, Star, Tag } from "lucide-react";

const CATEGORIES = ["All", "Medicine", "Food", "Toys", "Accessories"];

const SHOP_ITEMS = [
  {
    id: 1,
    name: "Premium Puppy Kibble",
    category: "Food",
    price: 45.99,
    rating: 4.8,
    reviews: 124,
    image: "/pet1.png", // reusing images for demo
    tag: "Best Seller"
  },
  {
    id: 2,
    name: "Flea & Tick Prevention (3-pack)",
    category: "Medicine",
    price: 32.50,
    rating: 4.9,
    reviews: 89,
    image: "/pet2.png"
  },
  {
    id: 3,
    name: "Interactive Laser Toy",
    category: "Toys",
    price: 15.00,
    rating: 4.5,
    reviews: 210,
    image: "/pet2.png",
    tag: "Sale"
  },
  {
    id: 4,
    name: "Adjustable Harness",
    category: "Accessories",
    price: 24.99,
    rating: 4.7,
    reviews: 56,
    image: "/pet1.png"
  },
  {
    id: 5,
    name: "Joint Health Supplement",
    category: "Medicine",
    price: 29.99,
    rating: 4.6,
    reviews: 42,
    image: "/pet1.png"
  },
  {
    id: 6,
    name: "Organic Catnip",
    category: "Toys",
    price: 8.50,
    rating: 4.9,
    reviews: 315,
    image: "/pet2.png"
  }
];

export default function ShopTab() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredItems = activeCategory === "All" 
    ? SHOP_ITEMS 
    : SHOP_ITEMS.filter(item => item.category === activeCategory);

  return (
    <div className="pt-8 px-4 animate-fade-in pb-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-on-surface tracking-tight mb-2">Pet Shop</h2>
          <p className="text-on-surface-variant">Everything your furry friend needs.</p>
        </div>
        <Button variant="outline" className="hidden sm:flex gap-2">
          <ShoppingCart size={18} />
          Cart (0)
        </Button>
      </div>

      {/* Categories */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-5 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
              activeCategory === category
                ? "bg-primary text-on-primary shadow-level-1"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map(item => (
          <Card key={item.id} className="overflow-hidden flex flex-col hover:shadow-level-2 transition-shadow group">
            <div className="aspect-square bg-surface-container-low relative p-4 flex items-center justify-center">
              {item.tag && (
                <div className="absolute top-2 left-2 bg-secondary text-on-secondary text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 z-10 shadow-sm">
                  <Tag size={10} /> {item.tag}
                </div>
              )}
              {/* Using a placeholder div to simulate item image since we only have pet1/pet2 */}
               <div className="w-3/4 h-3/4 rounded-2xl overflow-hidden shadow-level-1 group-hover:scale-105 transition-transform duration-300">
                 <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
               </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">{item.category}</div>
              <h3 className="text-base font-bold text-on-surface mb-1 line-clamp-2">{item.name}</h3>
              <div className="flex items-center gap-1 mb-3">
                <Star size={14} className="text-tertiary fill-tertiary" />
                <span className="text-xs font-bold text-on-surface">{item.rating}</span>
                <span className="text-xs text-on-surface-variant">({item.reviews})</span>
              </div>
              <div className="mt-auto flex items-center justify-between">
                <span className="text-xl font-bold text-on-surface">${item.price.toFixed(2)}</span>
                <Button size="sm" className="rounded-full shadow-sm hover:shadow-level-1">
                  Add to Cart
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Mobile Cart FAB */}
      <Button className="sm:hidden fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-level-2 flex items-center justify-center p-0">
        <ShoppingCart size={24} />
      </Button>
    </div>
  );
}
