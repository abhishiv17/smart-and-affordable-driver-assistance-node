'use client';

import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { navigationConfig } from '@/config/navigation';
import Link from 'next/link';

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [vehicles, setVehicles] = useState<{ id: string; vehicle_number: string }[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('vehicles').select('id, vehicle_number');
      if (data) setVehicles(data);
    };
    fetchVehicles();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter routes
  const routes = navigationConfig
    .flatMap(g => g.items)
    .filter(i => i.label.toLowerCase().includes(query.toLowerCase()));
  
  // Filter vehicles
  const matchedVehicles = vehicles
    .filter(v => v.vehicle_number.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5);

  return (
    <div className="relative flex items-center" ref={searchRef}>
      <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        className="h-7 w-40 sm:w-64 rounded-sm border border-border bg-muted/30 pl-8 pr-3 text-xs outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-all placeholder:uppercase placeholder:tracking-wider"
      />
      
      {isOpen && query.length > 0 && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full sm:w-[320px] rounded-sm border border-border bg-background shadow-2xl z-50 overflow-hidden flex flex-col max-h-[400px]">
          <div className="overflow-y-auto">
            {routes.length > 0 && (
              <div className="py-2">
                <p className="sadan-label px-3 mb-1">Navigation</p>
                {routes.map(r => (
                  <Link
                    key={r.href}
                    href={r.href}
                    onClick={() => { setIsOpen(false); setQuery(''); }}
                    className="flex items-center gap-3 px-3 py-2 text-xs hover:bg-muted transition-colors outline-none focus:bg-muted"
                  >
                    <r.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium uppercase tracking-wider">{r.label}</span>
                  </Link>
                ))}
              </div>
            )}
            
            {routes.length > 0 && matchedVehicles.length > 0 && (
              <div className="h-px bg-border/50" />
            )}

            {matchedVehicles.length > 0 && (
              <div className="py-2">
                <p className="sadan-label px-3 mb-1">Vehicles</p>
                {matchedVehicles.map(v => (
                  <Link
                    key={v.id}
                    href={`/vehicles/${v.id}`}
                    onClick={() => { setIsOpen(false); setQuery(''); }}
                    className="flex items-center gap-3 px-3 py-2 text-xs hover:bg-muted transition-colors outline-none focus:bg-muted"
                  >
                    <div className="h-4 w-4 rounded-full bg-[var(--color-bauhaus-blue)]/20 flex items-center justify-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-bauhaus-blue)]" />
                    </div>
                    <span className="font-mono">{v.vehicle_number}</span>
                  </Link>
                ))}
              </div>
            )}
            
            {routes.length === 0 && matchedVehicles.length === 0 && (
              <div className="p-6 text-center text-xs text-muted-foreground uppercase tracking-wider">
                No results found for "{query}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
