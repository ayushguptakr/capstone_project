import { useCallback, useRef, useState } from "react";

function jitter(max = 10) {
  return Math.round((Math.random() * 2 - 1) * max);
}

export default function useXPAnimation() {
  const [xpItems, setXPItems] = useState([]);
  const idRef = useRef(0);

  const showXP = useCallback((amount = 0, position) => {
    const id = ++idRef.current;
    const x = (typeof position?.x === "number" ? position.x : window.innerWidth * 0.5) + jitter(10);
    const y = typeof position?.y === "number" ? position.y : window.innerHeight * 0.58;

    setXPItems((prev) => [...prev, { id, amount, x, y }]);
    window.setTimeout(() => {
      setXPItems((prev) => prev.filter((i) => i.id !== id));
    }, 1200);
  }, []);

  const clearXP = useCallback(() => setXPItems([]), []);

  return { xpItems, showXP, clearXP };
}
