import React, { useEffect } from "react";

export function useAutoScroll(ref: React.RefObject<HTMLDivElement | null>, intervalTime = 2000) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let interval: number;

    const startScroll = () => {
      interval = window.setInterval(() => {
        if (!el) return;
        
        // Find the width of the first child plus the gap (assumed 16px for gap-4)
        const firstChild = el.firstElementChild as HTMLElement;
        const scrollAmount = firstChild ? firstChild.offsetWidth + 16 : 250;

        const { scrollLeft, scrollWidth, clientWidth } = el;
        // If we are at the end, jump back to start smoothly
        if (Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 5) {
          el.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          el.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
      }, intervalTime);
    };

    startScroll();

    // Pause auto-scroll on interaction so user can slide manually
    const handleTouchStart = () => window.clearInterval(interval);
    const handleTouchEnd = () => startScroll();

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.clearInterval(interval);
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [ref, intervalTime]);
}
