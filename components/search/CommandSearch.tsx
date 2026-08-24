"use client";

import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import { useSearchContext } from "@/components/search/SearchProvider";

export function CommandSearch() {
  const { open, setOpen, vehicles } = useSearchContext();
  const router = useRouter();

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search vehicles... (Ctrl+K)" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Vehicles">
          {vehicles.map((v) => (
            <CommandItem
              key={v.id}
              onSelect={() => {
                router.push(`/fleet/${v.id}`);
                setOpen(false);
              }}
            >
              {v.vehicle_number}
              {v.model ? ` — ${v.model}` : ""}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}