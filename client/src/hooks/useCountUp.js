import { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

/**
 * Animates a number when the element scrolls into view.
 * @param {number} end - target value
 * @param {{ duration?: number, decimals?: number }} opts
 */
export function useCountUp(end, opts = {}) {
  const { duration = 1400, decimals = 0 } = opts;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const start = performance.now();
    const from = 0;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = easeOutCubic(t);
      const v = from + (end - from) * eased;
      setValue(decimals > 0 ? Number(v.toFixed(decimals)) : Math.floor(v));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isInView, end, duration, decimals]);

  return { ref, value, started: isInView };
}
