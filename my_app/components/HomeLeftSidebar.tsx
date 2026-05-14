"use client";
import React from "react";
import { Card } from "./ui/card";
import { Newspaper, Star, TrendingUp } from "lucide-react";

export default function HomeLeftSidebar() {
  return (
    <div className="hidden lg:block w-[280px] xl:w-[320px] shrink-0 sticky top-24 space-y-6 pt-8">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-on-surface tracking-tight">Latest Pet News</h2>
        <p className="text-xs text-on-surface-variant mt-1">Trending stories & tips</p>
      </div>

      {/* News 1 */}
      <Card className="p-4 border-primary/20 bg-primary/5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
        <div className="flex items-start gap-3">
          <Newspaper size={20} className="text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-primary mb-1">New Pet Friendly Parks</h3>
            <p className="text-xs text-on-surface leading-relaxed">
              The city council just approved 3 new off-leash dog parks opening this summer.
            </p>
            <div className="flex items-center gap-1 text-[10px] text-primary font-medium mt-2 bg-primary/10 w-fit px-2 py-0.5 rounded">
              <TrendingUp size={10} /> Trending
            </div>
          </div>
        </div>
      </Card>

      {/* News 2 */}
      <Card className="p-4 border-secondary/20 bg-secondary/5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary"></div>
        <div className="flex items-start gap-3">
          <Star size={20} className="text-secondary shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-secondary mb-1">Top 5 Dog Toys of 2026</h3>
            <p className="text-xs text-on-surface leading-relaxed">
              Check out our latest review of the most durable and fun toys for heavy chewers.
            </p>
          </div>
        </div>
      </Card>
      
      {/* News 3 */}
      <Card className="p-4 border-tertiary/20 bg-tertiary/5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-tertiary"></div>
        <div className="flex items-start gap-3">
          <Newspaper size={20} className="text-tertiary shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-tertiary mb-1">Diet Tips for Senior Cats</h3>
            <p className="text-xs text-on-surface leading-relaxed">
              Learn how to adjust your older cat's diet to keep them healthy and active.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
