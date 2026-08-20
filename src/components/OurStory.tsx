"use client";
import React, { useEffect, useRef } from "react";
import Noise from "./ui/Noise";
import ButtonFill from "./ui/ButtonFill";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const OurStory = () => {
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (topRef.current) {
      gsap.to(topRef.current, {
        backgroundPosition: "center -20%",
        ease: "none",
        scrollTrigger: {
          trigger: topRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(topRef.current, {
        scale: 1.05,
        ease: "none",
        scrollTrigger: {
          trigger: topRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }
  }, []);
  return (
    <>
      <div
        id="our-story"
        className="relative my-20 h-screen w-screen scroll-mt-24 overflow-hidden"
      >
        {/* Background image div — this is the only thing we animate */}
        <div
          ref={topRef}
          className="absolute top-0 left-0 z-0 h-full w-full bg-[url(https://res.cloudinary.com/u3kraw33/image/upload/v1787262030/beccas-knotique/images/becca.jpg)] bg-cover bg-bottom"
        ></div>

        {/* Overlay with text and button — stays static */}
        <div className="relative z-10 flex h-screen w-full flex-col items-center justify-center gap-3 bg-black/40 backdrop-blur-[1px]">
          <p className="font-akira text-center text-3xl text-white md:text-5xl">
            Embrace independence <br /> and redefine <br /> your{" "}
            <span className="font-lokicola">fashion</span>
          </p>

          <ButtonFill
            href="/our-story"
            btnName="Our Story"
            btnClassName="border-white px-10 py-2"
            spanClassName="bg-white"
            secSpanClassName="text-white group-hover:text-black"
          />
        </div>

        {/* Noise overlay stays on top */}
        <Noise
          patternSize={250}
          patternScaleX={2}
          patternScaleY={2}
          patternRefreshInterval={2}
          patternAlpha={15}
        />
      </div>
    </>
  );
};

export default OurStory;
