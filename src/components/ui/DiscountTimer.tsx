"use client";

import React, { useEffect, useMemo, useState } from "react";

interface DiscountTimerProps {
  endTime: Date | string | number;
  title?: string;
  expiredText?: string;
  showLabels?: boolean;
  className?: string;
  onExpire?: () => void;
}

type CountdownState = {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

const toCountdownState = (target: number): CountdownState => {
  const now = Date.now();
  const total = Math.max(target - now, 0);

  return {
    total,
    days: Math.floor(total / DAY),
    hours: Math.floor((total % DAY) / HOUR),
    minutes: Math.floor((total % HOUR) / MINUTE),
    seconds: Math.floor((total % MINUTE) / SECOND),
  };
};

const pad = (value: number) => String(value).padStart(2, "0");

const DiscountTimer = ({
  endTime,
  title = "Offer ends in",
  expiredText = "Offer has ended",
  showLabels = true,
  className = "",
  onExpire,
}: DiscountTimerProps) => {
  const targetTime = useMemo(() => new Date(endTime).getTime(), [endTime]);
  const [timeLeft, setTimeLeft] = useState<CountdownState>(() =>
    toCountdownState(targetTime)
  );
  const [hasExpired, setHasExpired] = useState(timeLeft.total <= 0);

  useEffect(() => {
    const next = toCountdownState(targetTime);
    setTimeLeft(next);
    setHasExpired(next.total <= 0);

    if (next.total <= 0) {
      onExpire?.();
      return;
    }

    const timerId = window.setInterval(() => {
      const updated = toCountdownState(targetTime);
      setTimeLeft(updated);

      if (updated.total <= 0) {
        window.clearInterval(timerId);
        setHasExpired(true);
        onExpire?.();
      }
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [targetTime, onExpire]);

  if (hasExpired) {
    return (
      <div
        className={`rounded-xl border border-stone-200 bg-stone-100 px-4 py-3 text-sm font-semibold text-stone-600 ${className}`}
      >
        {expiredText}
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-rose-200/80 bg-linear-to-r from-rose-50 via-white to-amber-50 p-4 shadow-sm ${className}`}
    >
      <p className="text-xs font-semibold tracking-[0.12em] text-stone-600 uppercase">
        {title}
      </p>

      <div className="mt-3 grid grid-cols-4 gap-2 sm:gap-3">
        {[
          { label: "Days", value: timeLeft.days },
          { label: "Hours", value: timeLeft.hours },
          { label: "Minutes", value: timeLeft.minutes },
          { label: "Seconds", value: timeLeft.seconds },
        ].map((unit) => (
          <div
            key={unit.label}
            className="rounded-xl border border-white bg-white/90 px-2 py-2 text-center shadow-[0_6px_18px_-12px_rgba(0,0,0,0.4)]"
          >
            <p className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
              {pad(unit.value)}
            </p>
            {showLabels && (
              <p className="text-[10px] font-semibold tracking-[0.08em] text-stone-500 uppercase">
                {unit.label}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscountTimer;
