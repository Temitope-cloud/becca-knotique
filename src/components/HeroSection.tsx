import React from "react";
import Header from "./Header";
import Noise from "./ui/Noise";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const HeroSection = () => {
  return (
    <>
      <div className="h-screen w-screen" data-aos="fade-up">
        <div className="relative h-full w-full">
          <div className="h-full w-full flex-1">
            <div
              className="h-full w-full"
              style={{
                position: "relative",
                overflow: "hidden",
              }}
            >
              <video
                autoPlay
                muted
                loop
                playsInline
                className="h-full w-full object-cover"
              >
                <source src="/videos/moving.mp4" />
              </video>
              <Noise
                patternSize={250}
                patternScaleX={1}
                patternScaleY={1}
                patternRefreshInterval={2}
                patternAlpha={15}
              />
            </div>
          </div>

          <div className="absolute inset-0 h-screen w-screen bg-black/50 backdrop-blur-[2px]">
            <div className="absolute top-0 left-0 z-50 w-full">
              {" "}
              <Header />
            </div>

            <div className="absolute bottom-[15%] left-10">
              <p className="w-full text-white lowercase">founded in 2023</p>
              <h2 className="font-apparel w-full text-8xl font-bold text-white uppercase">
                Fashion in Crochet
              </h2>
            </div>

            <div className="absolute right-10 bottom-30 hidden w-[30%] md:block">
              <p className="text-white">
                We bring fashion that transcends time, a blends of classic
                aesthetics with modern materials.
              </p>
              <Link
                href="/products"
                className="bg-primary/90 hover:bg-primary mt-2 flex w-full cursor-pointer items-center justify-center rounded-sm py-3 text-white transition-all duration-300"
              >
                Shop Now
                <ArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </div>{" "}
    </>
  );
};

export default HeroSection;
