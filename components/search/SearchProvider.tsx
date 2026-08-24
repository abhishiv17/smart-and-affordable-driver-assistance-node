"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DbVehicle } from "@/types/database";

type SearchContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
  vehicles: DbVehicle[];
};

const SearchContext = createContext<SearchContextType | null>(null);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [vehicles, setVehicles] = useState<DbVehicle[]>([]);

  // Global Ctrl+K / Cmd+K listener — lives here once, instead of in every
  // component that wants to trigger search.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch vehicles once so search works on every dashboard page, not just
  // the page that happens to fetch vehicles server-side.
  useEffect(() => {
    async function loadVehicles() {
      const supabase = createClient();
      const { data, error } = await supabase.from("vehicles").select("*");
      if (!error && data) setVehicles(data);
    }
    loadVehicles();
  }, []);

  return (
    <SearchContext.Provider value={{ open, setOpen, vehicles }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchContext() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearchContext must be used inside SearchProvider");
  }
  return context;
}