export function getXPPositionFromEvent(event, fallback = {}) {
  const centerX = typeof fallback.x === "number" ? fallback.x : window.innerWidth * 0.5;
  const centerY = typeof fallback.y === "number" ? fallback.y : window.innerHeight * 0.58;

  if (!event) return { x: centerX, y: centerY };

  if (typeof event.clientX === "number" && typeof event.clientY === "number") {
    return { x: event.clientX, y: event.clientY };
  }

  const el = event.currentTarget;
  if (el && typeof el.getBoundingClientRect === "function") {
    const rect = el.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  return { x: centerX, y: centerY };
}
