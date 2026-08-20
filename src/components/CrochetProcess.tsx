"use client";
import React, { useRef } from "react";
import { Button } from "./ui/button";
import {
  LayoutGrid,
  MessageCircle,
  Package,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { CartIcon, CartIconHandle } from "./ui/cart";
import { useRouter } from "next/navigation";

const STEPS = [
  {
    id: 1,
    title: "Browse Designs",
    description: "Explore our collection or share your own vision",
    icon: LayoutGrid,
    accent: "from-rose-100 to-amber-50 text-rose-800 ring-rose-200/60",
  },
  {
    id: 2,
    title: "Message on WhatsApp",
    description: "Chat with us to confirm your order details",
    icon: MessageCircle,
    accent: "from-emerald-50 to-teal-50 text-emerald-800 ring-emerald-200/60",
  },
  {
    id: 3,
    title: "Confirm Order",
    description: "We start crafting your piece with care",
    icon: Sparkles,
    accent: "from-amber-100 to-orange-50 text-amber-900 ring-amber-200/70",
  },
  {
    id: 4,
    title: "Delivery",
    description: "Your handmade piece arrives at your door",
    icon: Package,
    accent: "from-sky-50 to-indigo-50 text-sky-900 ring-sky-200/60",
  },
] as const;

const CrochetProcess = () => {
  const router = useRouter();

  const cartRef = useRef<CartIconHandle>(null);

  return (
    <section
      id="process"
      className="relative scroll-mt-24 overflow-hidden border-t border-stone-200/80 bg-linear-to-b from-[#faf8f5] via-stone-50 to-[#f5f0ea]"
    >
      <div
        className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-amber-200/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-rose-200/15 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-10 px-4 py-14 sm:px-6 sm:py-16 md:gap-12 md:py-20 lg:flex-row lg:items-center lg:gap-14 lg:px-8">
        <div className="w-full shrink-0 lg:sticky lg:top-24 lg:w-[min(100%,28rem)] lg:flex-none xl:w-[min(100%,32rem)]">
          <div className="group relative overflow-hidden rounded-2xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.2)] ring-1 ring-stone-900/10">
            <img
              src="https://res.cloudinary.com/u3kraw33/image/upload/v1787262021/beccas-knotique/becca-knitting.jpg"
              alt="Handmade crochet work in progress"
              className="w-full cursor-pointer object-cover transition-all duration-700 ease-out"
            />
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-t from-stone-900/25 via-transparent to-transparent opacity-80"
              aria-hidden
            />
          </div>
          <p className="mt-3 text-center text-xs tracking-wide text-stone-500 lg:text-left">
            Every stitch is made by hand — quality you can feel.
          </p>
        </div>
        {/* <div className="h-full w-full flex-1">
          <img
            src="https://res.cloudinary.com/u3kraw33/image/upload/v1787262021/beccas-knotique/becca-knitting.jpg"
            alt="Handmade crochet work in progress"
            className="h-full w-full cursor-pointer rounded-xl object-cover grayscale transition-all duration-700 ease-out group-hover:grayscale-0"
          />
        </div> */}

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-amber-600/90 ring-2 ring-amber-200"
              aria-hidden
            />
            <p className="text-xs font-semibold tracking-[0.2em] text-stone-500 uppercase">
              Crochet process
            </p>
          </div>

          <h2 className="font-arial text-4xl leading-[1.1] tracking-tight text-stone-900 sm:text-5xl">
            How your piece comes to life
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-stone-600">
            Simple steps from choosing a design to unboxing something made
            especially for you — warm, wearable, and one of a kind.
          </p>

          <div className="mt-8 grid gap-2 md:grid-cols-2 md:gap-10">
            <Button
              size="lg"
              className="h-11 cursor-pointer gap-2 rounded-xl bg-stone-900 px-6 text-base shadow-lg shadow-stone-900/15 hover:bg-stone-800"
              onMouseEnter={() => cartRef.current?.startAnimation()}
              onMouseLeave={() => cartRef.current?.stopAnimation()}
              onClick={() => router.push("/products")}
            >
              <CartIcon ref={cartRef} className="size-4" />
              Shop collection
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 cursor-pointer gap-2 rounded-xl border-stone-300 bg-white/80 px-6 text-base text-stone-800 backdrop-blur-sm hover:bg-stone-50"
              onClick={() =>
                window.open("https://wa.me/2348029086678", "_blank")
              }
              // open in another tab
            >
              <MessageCircle className="size-4 text-emerald-700" />
              Chat on WhatsApp
            </Button>
          </div>

          <div className="relative mt-12">
            <span
              className="absolute top-4 bottom-4 left-4.5 hidden w-px bg-linear-to-b from-stone-300 via-amber-200/80 to-stone-300 md:block"
              aria-hidden
            />
            <ol className="m-0 list-none space-y-0 p-0">
              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isLast = idx === STEPS.length - 1;
                return (
                  <li
                    key={step.id}
                    className={`relative md:pl-14 ${!isLast ? "pb-10" : ""}`}
                  >
                    <div className="absolute top-1 left-0 hidden md:flex md:h-9 md:w-9 md:items-center md:justify-center">
                      <span className="z-10 flex h-9 w-full items-center justify-center rounded-full border-2 border-white bg-[#faf8f5] text-sm font-bold text-stone-700 shadow-sm ring-1 ring-stone-200">
                        <p className="w-full text-center"> {step.id} </p>
                      </span>
                    </div>

                    <article className="rounded-2xl border border-stone-200/90 bg-white/75 p-5 shadow-sm backdrop-blur-sm transition hover:border-stone-300/90 hover:shadow-md sm:p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br shadow-inner ring-1 ${step.accent}`}
                        >
                          <Icon className="size-6 w-full" strokeWidth={1.75} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline gap-2">
                            <h3 className="font-arial text-2xl text-stone-900 sm:text-[1.65rem]">
                              {step.title}
                            </h3>
                            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-600 md:hidden">
                              Step {step.id}
                            </span>
                          </div>
                          <p className="mt-2 text-[15px] leading-relaxed text-stone-600">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CrochetProcess;
