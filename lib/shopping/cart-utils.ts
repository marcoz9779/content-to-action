export function getCartCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem("cta-shopping-lists");
    if (!raw) return 0;
    const lists = JSON.parse(raw) as Array<{ items: Array<{ checked: boolean }> }>;
    return lists.reduce(
      (sum, list) => sum + list.items.filter((i) => !i.checked).length,
      0
    );
  } catch {
    return 0;
  }
}
