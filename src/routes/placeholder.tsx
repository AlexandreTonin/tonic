import { NAV } from "@/components/layout/nav";
import { useLocation } from "@tanstack/react-router";

export function Placeholder() {
  const { pathname } = useLocation();
  const title = NAV.flatMap((g) => g.items).find(
    (i) => i.to === pathname,
  )?.label;

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">Under construction.</p>
    </div>
  );
}
