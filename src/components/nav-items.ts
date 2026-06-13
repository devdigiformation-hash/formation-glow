import {
  LayoutDashboard,
  Wand2,
  PoundSterling,
  UserCircle,
  Settings,
  ShieldCheck,
  LogOut,
  Briefcase,
  ShoppingBag,
  Bot,
  Compass,
  BookOpen,
} from "lucide-react";

export type NavItem = {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  ai?: boolean;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    label: "Partner",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
      { title: "B2B Services", url: "/services", icon: Briefcase },
      { title: "Build Brand", url: "/build-brand", icon: Compass },
      { title: "Partner Profile", url: "/partner-profile", icon: UserCircle },
      { title: "Marketing Guide", url: "/marketing-guide", icon: BookOpen },
      { title: "Rebrand Studio", url: "/rebrand-studio", icon: Wand2 },
      { title: "DigiFormation AI Assistant", url: "/smart-agent", icon: Bot, ai: true },
      { title: "My Orders", url: "/my-orders", icon: ShoppingBag },
      { title: "Earnings", url: "/earnings", icon: PoundSterling },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Settings", url: "/settings", icon: Settings },
    ],
  },
  {
    label: "Admin",
    items: [
      { title: "Admin", url: "/admin", icon: ShieldCheck },
    ],
  },
];

// Mobile bottom nav: 5 priority items along the journey.
export const mobileBottomNav: NavItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Brand", url: "/build-brand", icon: Compass },
  { title: "Guide", url: "/marketing-guide", icon: BookOpen },
  { title: "Rebrand", url: "/rebrand-studio", icon: Wand2 },
  { title: "AI Assistant", url: "/smart-agent", icon: Bot, ai: true },
];

// Footer-only logout action
export const logoutNavItem: NavItem = {
  title: "Logout",
  url: "/logout",
  icon: LogOut,
};
