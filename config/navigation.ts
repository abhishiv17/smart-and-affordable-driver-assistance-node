// =============================================================================
// Navigation Configuration — Digital Bauhaus
// =============================================================================

import {
  LayoutDashboard,
  MapPin,
  Truck,
  Users,
  AlertTriangle,
  Brain,
  Radio,
  LineChart,
  type LucideIcon,
} from 'lucide-react';

/**
 * A single navigation item in the sidebar.
 */
export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Numbered index for editorial navigation (e.g., "01") */
  number: string;
  /** Optional badge text (e.g., alert count) */
  badge?: string;
  /** Whether this item is disabled */
  disabled?: boolean;
}

/**
 * A group of navigation items with an optional section label.
 */
export interface NavGroup {
  label?: string;
  items: NavItem[];
}

/**
 * Main sidebar navigation structure.
 * Editorial numbered navigation — Digital Bauhaus style.
 */
export const navigationConfig: NavGroup[] = [
  {
    items: [
      {
        number: '01',
        label: 'Overview',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        number: '02',
        label: 'Live Map',
        href: '/map',
        icon: MapPin,
      },
      {
        number: '03',
        label: 'Vehicles',
        href: '/vehicles',
        icon: Truck,
      },
      {
        number: '04',
        label: 'Drivers',
        href: '/drivers',
        icon: Users,
      },
      {
        number: '05',
        label: 'Alerts',
        href: '/alerts',
        icon: AlertTriangle,
      },
      {
        number: '06',
        label: 'Intelligence',
        href: '/ai',
        icon: Brain,
      },
      {
        number: '07',
        label: 'Simulation',
        href: '/simulator',
        icon: Radio,
      },
    ],
  },
  {
    items: [
      {
        number: '08',
        label: 'Why SADAN?',
        href: '/business-case',
        icon: LineChart,
      },
    ],
  },
];
