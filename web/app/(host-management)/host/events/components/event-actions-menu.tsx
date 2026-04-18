import { eventDetail, eventDuplicate, eventEdit } from "@/app/routes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, MoreVertical, Pencil, Settings2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

const items = [
  { title: "Manage event", icon: Settings2, fn: eventDetail },
  { title: "Update event", icon: Pencil, fn: eventEdit },
  { title: "Duplicate event", icon: Copy, fn: eventDuplicate },
];

interface EventActionsMenuProps {
  id: string;
  name: string;
  onDelete: () => void;
}

export const EventActionsMenu = ({
  id,
  name,
  onDelete,
}: EventActionsMenuProps) => {
  const router = useRouter();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-md p-0 text-muted-foreground hover:bg-muted hover:text-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Actions for ${name}`}
        >
          <MoreVertical className="size-4 shrink-0" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={4} className="min-w-48">
        {items.map((item) => (
          <DropdownMenuItem
            key={item.title}
            className="cursor-pointer gap-2"
            onSelect={() => (item.fn ? router.push(item.fn(id)) : onDelete)}
          >
            <item.icon className="size-4 shrink-0" aria-hidden />
            {item.title}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer gap-2"
          onSelect={onDelete}
        >
          <Trash2 className="size-4 shrink-0" aria-hidden />
          Delete event
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
