"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

interface ParallelRevealProps {
  className?: string;
  src: string;
}

const ParallaxReveal = ({ className, src }: ParallelRevealProps) => {
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (imageRef.current) {
      gsap.to(imageRef.current, {
        backgroundPosition: "center 100%",
        ease: "none",
        scrollTrigger: {
          trigger: imageRef.current,
          start: "top 50%",
          end: "bottom 40%",
          scrub: true,
        },
      });
    }
  }, []);
  return (
    <>
      <div ref={imageRef} className={`${className} ${src}`} />
    </>
  );
};

export default ParallaxReveal;
