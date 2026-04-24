import { LayoutGrid, List } from "lucide-react";

export const VIEW_MODES = [
  { value: "column", icon: List, label: "Column view" },
  { value: "grid", icon: LayoutGrid, label: "Grid view" },
] as const;
