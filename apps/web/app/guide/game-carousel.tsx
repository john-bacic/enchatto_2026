"use client";

import { useRef, useState, type ReactNode } from "react";

/** The games strip: swipeable on phones, with a dot per game showing where you are. Wide screens show a grid */
export function GameCarousel({ labels, children }: { labels: string[]; children: ReactNode }) {
  const strip = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const onScroll = () => {
    const el = strip.current;
    if (!el) return;
    // The last card can't snap to the start, so the end of the strip counts as the last one
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) return setActive(labels.length - 1);
    const left = el.getBoundingClientRect().left;
    const cards = Array.from(el.children);
    const offsets = cards.map((card) => Math.abs(card.getBoundingClientRect().left - left));
    setActive(offsets.indexOf(Math.min(...offsets)));
  };

  const go = (i: number) =>
    strip.current?.children[i]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });

  return (
    <>
      <div ref={strip} className="gd-games" onScroll={onScroll}>
        {children}
      </div>
      <div className="gd-dots">
        {labels.map((label, i) => (
          <button
            key={label}
            type="button"
            className={i === active ? "on" : undefined}
            aria-label={label}
            aria-current={i === active || undefined}
            onClick={() => go(i)}
          />
        ))}
      </div>
    </>
  );
}
