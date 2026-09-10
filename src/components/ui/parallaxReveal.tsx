"use client";
import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
} from "motion/react";

interface ParallelRevealProps {
  className?: string;
  src: string;
}

const ParallaxReveal = ({ className, src }: ParallelRevealProps) => {
  const imageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: imageRef,
    offset: ["start end", "end start"],
  });
  const posY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const backgroundPosition = useMotionTemplate`center ${posY}`;

  return (
    <motion.div
      ref={imageRef}
      style={{ backgroundPosition }}
      className={`${className} ${src}`}
    />
  );
};

export default ParallaxReveal;
