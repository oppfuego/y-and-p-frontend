export const canonCity = (v?: string) => {
    const s = (v || "").toLowerCase();
    if (s === "milano") return "milan";
    if (s === "roma") return "rome";
    return s;
};

export const parseRange = (text: string) => {
    if (typeof text !== "string") return null;
    const t = text.replace(/\s+/g, "");
    const m = t.match(/^(\d{1,2})[./-](\d{1,2})[–-](\d{1,2})[./-](\d{1,2})$/i);
    if (!m) return null;
    const y = new Date().getFullYear();
    const start = new Date(y, Number(m[2]) - 1, Number(m[1]), 0, 0, 0, 0);
    const end = new Date(y, Number(m[4]) - 1, Number(m[3]), 23, 59, 59, 999);
    return { start, end };
};

export const isAvailableNow = (
  availability?: { city: string; startDate: string; endDate: string }[],
  city?: string
) => {
  if (!availability?.length) return false;
  const now = new Date();
  const cityKey = canonCity(city);
  return availability.some(a => {
    const aKey = canonCity(a.city);
    if (cityKey && aKey && aKey !== cityKey) return false;
    const start = new Date(a.startDate);
    const end = new Date(a.endDate);
    return now >= start && now <= end;
  });
};
