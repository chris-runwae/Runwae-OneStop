import { categoryFromType, type SavedItemType } from "@/lib/categories";

export function CategoryBadge({ type }: { type: SavedItemType }) {
  const c = categoryFromType(type);
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-semibold text-white"
      style={{ background: c.color }}
    >
      {c.emoji} {c.label}
    </span>
  );
}
