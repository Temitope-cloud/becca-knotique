"use client";
import { ArrowRight } from "lucide-react";
import React from "react";
import ButtonFill from "./ui/ButtonFill";
import { getProductsByCategory } from "@/data/Products";

const NewCollection = () => {
  const newCollection = getProductsByCategory("new-collection");
  return (
    <section
      id="collection"
      className="relative w-full scroll-mt-24 px-4 py-14 sm:px-6 sm:py-16 md:py-20"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-6 z-0 mx-auto h-64 max-w-5xl rounded-full bg-amber-200/25 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div
          data-aos="zoom-in-down"
          className="relative overflow-hidden rounded-3xl border border-stone-200/80 bg-white/85 p-6 shadow-[0_25px_70px_-35px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:p-8 md:p-10"
        >
          <div
            className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-rose-200/35 blur-2xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-amber-200/30 blur-2xl"
            aria-hidden
          />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="inline-flex items-center rounded-full border border-stone-300/80 bg-stone-50/90 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-stone-600 uppercase">
                New collection
              </span>
              <h2 className="mt-4 max-w-2xl text-4xl leading-[1.05] font-semibold tracking-tight text-stone-900 sm:text-5xl md:text-6xl">
                Handmade pieces
                <span className="block text-stone-500">
                  with modern elegance
                </span>
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-stone-600 sm:text-base">
                Discover a curated edit of cozy textures, clean silhouettes, and
                thoughtful handcrafted details made to elevate everyday looks.
              </p>
            </div>

            <ButtonFill
              href="shop"
              btnName="Shop the collection"
              icon={<ArrowRight className="size-4" />}
              btnClassName="border-stone-900 px-8 py-2.5 sm:px-10"
              spanClassName="bg-stone-900"
              secSpanClassName="group-hover:text-white"
            />
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3">
          {newCollection.slice(0, 3).map((item, idx) => {
            const primaryImage = item.image ?? item.images?.[0];
            const hoverImage = item.hoverImage ?? item.images?.[1];

            return (
            <article
              key={item.slug || idx}
              data-aos="zoom-in-down"
              data-aos-delay={idx * 90}
              className="group/card relative overflow-hidden rounded-3xl border border-stone-200/80 bg-white p-3 shadow-[0_20px_60px_-34px_rgba(0,0,0,0.45)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_26px_65px_-28px_rgba(0,0,0,0.42)]"
            >
              <div
                className="pointer-events-none absolute top-4 left-4 z-10 rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-stone-700 uppercase shadow-sm"
                aria-hidden
              >
                Just dropped
              </div>

              <div className="relative aspect-3/4 w-full overflow-hidden rounded-2xl bg-stone-100 ring-1 ring-stone-900/10">
                {primaryImage ? (
                  <img
                    src={primaryImage}
                    alt={item.name}
                    className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover/card:scale-[1.03]"
                  />
                ) : null}
                {hoverImage ? (
                  <img
                    src={hoverImage}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 h-full w-full object-cover object-center opacity-0 transition-opacity duration-700 ease-out group-hover/card:opacity-100"
                  />
                ) : null}
                <div
                  className="pointer-events-none absolute inset-0 bg-linear-to-t from-stone-900/30 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover/card:opacity-90"
                  aria-hidden
                />
              </div>

              <div className="mt-5 flex items-start justify-between gap-4 px-1 pb-1">
                <div className="min-w-0">
                  <h3 className="text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-stone-600">
                    {item.subtitle}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-lg font-semibold text-stone-900 sm:text-xl">
                    {item.price}
                  </p>
                  <p className="text-sm text-stone-400 line-through decoration-stone-300 decoration-1">
                    {item.oldPrice}
                  </p>
                </div>
              </div>
            </article>
          )})}
        </div>
      </div>
    </section>
  );
};

export default NewCollection;
