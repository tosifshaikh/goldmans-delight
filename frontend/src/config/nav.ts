import {
  BarChart3,
  Boxes,
  ChefHat,
  Factory,
  LayoutDashboard,
  LucideIcon,
  Package,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon?: LucideIcon;
  /** permission code required to see this item; omit = always visible */
  permission?: string;
  disabled?: boolean;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Masters",
    items: [
      {
        label: "Roles",
        href: "/masters/roles",
        icon: ShieldCheck,
        permission: "roles.view",
      },
      {
        label: "Users",
        href: "/masters/users",
        icon: Users,
        permission: "users.view",
/*         disabled: true,
 */      },

        { label: "Items", href: "/masters/items", icon: Package },
{
        label: "Ingredients",
        href: "/masters/ingredients",
        icon: Package,
        permission: "ingredients.view",

      },
      {
        label: "Recipes",
        href: "/masters/recipes",
        icon: ChefHat,
        permission: "recipes.view",
        disabled: true,
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        label: "Stock",
        href: "/stock",
        icon: Boxes,
        permission: "stock.view",
        disabled: true,
      },
      {
        label: "Production",
        href: "/production",
        icon: Factory,
        permission: "production.view",
        disabled: true,
      },
      {
        label: "Reports",
        href: "/reports",
        icon: BarChart3,
        permission: "reports.view",
        disabled: true,
      },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Settings", href: "/settings", icon: Settings, disabled: true },
    ],
  },
];
