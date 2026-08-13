// =============================================================================
// Navigation Configuration
// =============================================================================

import {
  LayoutDashboard,
  Truck,
  Users,
  AlertTriangle,
  Brain,
  Radio,
  type LucideIcon,
} from 'lucide-react';

/**
 * A single navigation item in the sidebar.
 */
export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
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
 */
export const navigationConfig: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: 'Fleet',
    items: [
      {
        label: 'Vehicles',
        href: '/vehicles',
        icon: Truck,
      },
      {
        label: 'Drivers',
        href: '/drivers',
        icon: Users,
      },
    ],
  },
  {
    label: 'Safety',
    items: [
      {
        label: 'Alerts',
        href: '/alerts',
        icon: AlertTriangle,
      },
      {
        label: 'AI Intelligence',
        href: '/ai',
        icon: Brain,
      },
    ],
  },
  {
    label: 'Tools',
    items: [
      {
        label: 'Device Simulator',
        href: '/simulator',
        icon: Radio,
      },
    ],
  },
];
