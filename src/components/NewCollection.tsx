"use client";
import { newCollection } from "@/data/Products";
import { ArrowRight } from "lucide-react";
import React from "react";
import ButtonFill from "./ui/ButtonFill";

const NewCollection = () => {
  return (
    <section
      id="collection"
      className="w-full scroll-mt-24 px-4 py-12 sm:px-6 sm:py-14 md:py-16"
    >
      <div className="mx-auto max-w-7xl">
        <div
          data-aos="zoom-in-down"
          className="flex flex-col gap-5 border-b border-stone-200/90 pb-6 md:flex-row md:items-end md:justify-between md:pb-8"
        >
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-stone-500 uppercase">
              New collection
            </p>
            <h2 className="font-bylast mt-2 text-4xl leading-[1.05] tracking-tight text-stone-900 sm:text-5xl md:text-6xl">
              Crochet wears
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-stone-600 sm:text-base">
              Fresh drops, handmade details — pieces designed to feel as good as
              they look.
            </p>
          </div>

          <ButtonFill
            href="shop"
            btnName="See products"
            icon={<ArrowRight className="size-4" />}
            btnClassName="border-stone-900 px-8 py-2.5 sm:px-10"
            spanClassName="bg-slate-800"
            secSpanClassName="group-hover:text-white"
          />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-7 lg:mt-12 lg:grid-cols-3 lg:gap-8">
          {newCollection.map((item, idx) => (
            <article
              key={idx}
              data-aos="zoom-in-down"
              data-aos-delay={idx * 80}
              className="group/card flex flex-col"
            >
              <div className="relative aspect-3/4 w-full overflow-hidden rounded-2xl bg-stone-200 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.18)] ring-1 ring-stone-900/10 transition-shadow duration-300 hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.22)]">
                <img
                  src={item.src}
                  alt={item.name}
                  className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover/card:scale-[1.02]"
                />
                <img
                  src={item.hoverSrc}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 h-full w-full object-cover object-center opacity-0 transition-opacity duration-700 ease-out group-hover/card:opacity-100"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-linear-to-t from-stone-900/35 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover/card:opacity-80"
                  aria-hidden
                />
              </div>

              <div className="mt-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-bylast text-xl tracking-tight text-stone-900 sm:text-2xl">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-sm text-stone-600">{item.subtitle}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-arial text-lg font-semibold text-stone-900 sm:text-xl">
                    {item.newPrice}
                  </p>
                  <p className="text-sm text-stone-400 line-through decoration-stone-300">
                    {item.oldPrice}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewCollection;
