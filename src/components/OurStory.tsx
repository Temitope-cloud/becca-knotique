"use client";
import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
} from "motion/react";
import Noise from "./ui/Noise";
import ButtonFill from "./ui/ButtonFill";

const OurStory = () => {
  const topRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: topRef,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);
  const posY = useTransform(scrollYProgress, [0, 1], ["50%", "20%"]);
  const backgroundPosition = useMotionTemplate`center ${posY}`;

  return (
    <>
      <div
        id="our-story"
        className="relative my-20 h-screen w-screen scroll-mt-24 overflow-hidden"
      >
        {/* Background image div — this is the only thing we animate */}
        <motion.div
          ref={topRef}
          style={{ scale, backgroundPosition }}
          className="absolute top-0 left-0 z-0 h-full w-full bg-[url(https://res.cloudinary.com/u3kraw33/image/upload/v1787262030/beccas-knotique/images/becca.jpg)] bg-cover"
        ></motion.div>

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
