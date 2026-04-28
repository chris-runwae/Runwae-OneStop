"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RMark } from "./RMark";
import { cn } from "@/lib/utils";

const PEEK_CARDS = [
  {
    img: "https://picsum.photos/seed/lisbon-runwae/400/200",
    cat: "● Trending",
    catBg: "#FFE8F0",
    catColor: "#CC2560",
    title: "Lisbon in Spring",
    loc: "Portugal · Apr 18",
    pos: "top-[30px] left-[14px] right-[14px] rotate-0",
    rot: "0deg",
    delay: "0s",
  },
  {
    img: "https://picsum.photos/seed/dubai-runwae/400/200",
    cat: "🍽 Eat/Drink",
    catBg: "rgba(245,166,35,0.18)",
    catColor: "#B57102",
    title: "Tresind Studio",
    loc: "Dubai, UAE",
    pos: "top-[140px] left-[48px] right-[14px]",
    rot: "-3deg",
    delay: "0.6s",
  },
  {
    img: "https://picsum.photos/seed/iceland-runwae/400/200",
    cat: "🧭 Explore",
    catBg: "rgba(33,150,243,0.16)",
    catColor: "#0F5FA8",
    title: "Iceland Ring Road",
    loc: "7-day itinerary",
    pos: "top-[230px] left-[14px] right-[60px]",
    rot: "2deg",
    delay: "1.2s",
  },
] as const;

export function SplashClient() {
  // 0 = intro animation, 1 = pulse only, 2 = shifted + content visible
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1300);
    const t2 = setTimeout(() => setPhase(2), 1800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const shifted = phase >= 2;
  const pulsing = phase === 1;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#FF3D7F] text-white">
      {/* Decorative blurred orbs */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-20 -left-20 h-[360px] w-[360px] rounded-full opacity-45 blur-[60px]"
        style={{ background: "#FF8FB8" }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-32 h-[420px] w-[420px] rounded-full opacity-45 blur-[60px]"
        style={{ background: "#CC2560" }}
      />

      {/* Logo mark */}
      <div
        className={cn(
          "relative will-change-transform transition-transform duration-700 ease-[cubic-bezier(.2,.9,.25,1)]",
          phase === 0 && "rw-logo-intro",
          shifted && "-translate-y-44 scale-[0.62]"
        )}
      >
        <span
          aria-hidden
          className={cn(
            "absolute -inset-3 rounded-[32px] border-2 border-white/55 opacity-0",
            pulsing && "rw-pulse-ring"
          )}
        />
        <RMark
          size={124}
          className="block drop-shadow-[0_8px_30px_rgba(0,0,0,0.18)]"
        />
      </div>

      {/* Word-mark under logo (only visible pre-shift) */}
      {!shifted && (
        <div
          className="rw-word-fade mt-[22px] font-display text-[34px] font-bold tracking-[-0.03em] text-white opacity-0"
        >
          runwae
        </div>
      )}

      {/* Splash content reveal */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-9 transition-[transform,opacity] duration-700 ease-[cubic-bezier(.2,.9,.25,1)] delay-[80ms]",
          "lg:left-1/2 lg:right-auto lg:mx-auto lg:w-full lg:max-w-[1100px] lg:flex-row lg:items-center lg:justify-center lg:gap-16 lg:px-12 lg:pb-14",
          shifted
            ? "translate-y-0 opacity-100 lg:-translate-x-1/2 lg:translate-y-0"
            : "translate-y-16 pointer-events-none opacity-0 lg:-translate-x-1/2 lg:translate-y-16",
        )}
      >
        {/* Glass phone peek */}
        <div
          aria-hidden
          className="relative mx-auto mb-6 h-[300px] w-[228px] flex-shrink-0 overflow-hidden rounded-[32px] border border-white/30 bg-gradient-to-b from-white/15 to-white/5 backdrop-blur-2xl lg:mx-0 lg:mb-0 lg:h-[380px] lg:w-[280px]"
          style={{
            boxShadow:
              "0 30px 60px rgba(0,0,0,0.28), 0 8px 24px rgba(204,37,96,0.4)",
          }}
        >
          {/* iOS-style notch grip */}
          <span
            aria-hidden
            className="absolute left-1/2 top-2 z-10 h-[5px] w-20 -translate-x-1/2 rounded-full bg-white/50"
          />
          {PEEK_CARDS.map((c, i) => (
            <div
              key={i}
              className={cn(
                "rw-peek-float absolute overflow-hidden rounded-[14px] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.18)]",
                c.pos,
              )}
              style={{
                animationDelay: c.delay,
                ["--rw-rot" as string]: c.rot,
                transform: `rotate(${c.rot})`,
              }}
            >
              <div
                className="h-[74px] w-full bg-cover bg-center lg:h-24"
                style={{ backgroundImage: `url(${c.img})` }}
              />
              <div className="px-[9px] py-[7px]">
                <span
                  className="mb-1 inline-block rounded-full px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.06em]"
                  style={{ background: c.catBg, color: c.catColor }}
                >
                  {c.cat}
                </span>
                <div className="text-[11px] font-semibold leading-tight text-[#0F0F0F]">
                  {c.title}
                </div>
                <div className="mt-0.5 text-[9.5px] text-[#6B6B6B]">
                  {c.loc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Headline + CTAs */}
        <div className="lg:max-w-[440px] lg:text-left">
          <h1 className="mb-2.5 max-w-lg font-display text-[38px] font-bold leading-[1.02] tracking-[-0.03em] text-white text-balance lg:mb-3.5 lg:text-[64px]">
            Plan trips. Experience more.
          </h1>
          <p className="mb-[22px] max-w-md text-base font-normal leading-[1.45] text-white/75 text-balance lg:mb-7 lg:text-lg">
            Discover events, build itineraries, travel with friends.
          </p>
          <div className="flex w-full max-w-[340px] flex-col gap-2.5 lg:max-w-none lg:flex-row">
            <Link
              href="/sign-up"
              className="inline-flex h-[52px] w-full shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 text-[15px] font-semibold text-[#FF3D7F] shadow-[0_6px_18px_rgba(0,0,0,0.15)] transition-[transform,box-shadow] hover:shadow-[0_10px_28px_rgba(0,0,0,0.22)] active:scale-[0.97] lg:w-auto lg:flex-1"
            >
              Get started <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex h-[52px] w-full shrink-0 items-center justify-center gap-2 rounded-full border-[1.5px] border-white/55 bg-transparent px-6 text-[15px] font-semibold text-white transition-[background,transform] hover:bg-white/10 active:scale-[0.97] lg:w-auto lg:flex-1"
            >
              Sign in
            </Link>
          </div>
          <Link
            href="/sign-up"
            className="mt-3.5 inline-flex items-center gap-1.5 text-[13px] font-medium text-white/75 underline-offset-[3px] hover:text-white hover:underline"
          >
            or peek inside without signing up
            <ArrowRight className="h-3 w-3" strokeWidth={2.4} />
          </Link>
        </div>
      </div>
    </div>
  );
}
