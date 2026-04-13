"use client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

interface ButtonFillProps {
  btnName: string;
  btnClassName: string;
  spanClassName: string;
  secSpanClassName: string;
  icon?: ReactNode;
  href: string;
}

const ButtonFill = ({
  btnName,
  btnClassName,
  spanClassName,
  secSpanClassName,
  icon,
  href,
}: ButtonFillProps) => {
  const router = useRouter();
  return (
    <>
      <div>
        <button
          onClick={() => router.push(href)}
          className={`group relative cursor-pointer overflow-hidden rounded border uppercase transition-colors duration-500 active:scale-95 ${btnClassName}`}
        >
          <span
            className={`absolute inset-0 z-0 -translate-x-full transition-transform duration-500 group-hover:translate-x-0 ${spanClassName}`}
          ></span>
          <span
            className={`relative z-10 flex items-center gap-1 transition-colors duration-500 ${secSpanClassName}`}
          >
            {btnName} {icon}
          </span>
        </button>
      </div>
    </>
  );
};

export default ButtonFill;
