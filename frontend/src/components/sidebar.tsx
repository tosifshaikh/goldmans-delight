"use client";
import { clearToken } from "@/lib/auth";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NAV_GROUPS, NavItem } from "@/config/nav";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { LogOut, UserIcon } from "lucide-react";
import { Button } from "./ui/button";

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}
function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const active = isActive(pathname, item.href);
  const Icon = item.icon;

  if (item.disabled) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm",
          "text-muted-foreground/50 cursor-not-allowed select-none",
        )}
        title="Coming soon"
      >
        {Icon && <Icon className="h-4 w-4 shrink-0" />}
        <span className="truncate">{item.label}</span>
      </div>
    );
  }
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      )}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      <span className="truncate">{item.label}</span>
    </Link>
  );
}
export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const email = "admin@goldmans.dev";
  const fullName = "SuperAdmin";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function handleSignOut() {
    clearToken();
    router.replace("/login");
    router.refresh();
  }
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r bg-background">
      {/* Brand */}
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            GD
          </span>
          <span className="text-sm font-semibold">Goldman&apos;s Delight</span>
        </Link>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1">
        <nav className="space-y-6 p-3">
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink key={item.href} item={item} />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* User footer */}
      <div className="border-t p-3">
        <DropdownMenu>
  <DropdownMenuTrigger render={<Button variant="ghost" className="flex w-full items-center gap-3 p-2 h-auto justify-start" />}>
  <Avatar className="h-8 w-8">
    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
  </Avatar>
  <div className="min-w-0 flex-1 text-left">
    <p className="truncate text-sm font-medium">{fullName}</p>
    <p className="truncate text-xs text-muted-foreground">{email}</p>
  </div>
</DropdownMenuTrigger>

  <DropdownMenuContent align="end" side="top" className="w-56">
     <DropdownMenuGroup>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem disabled>
        <UserIcon className="mr-2 h-4 w-4" />
        Profile
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={handleSignOut}
        className="text-red-600 focus:text-red-600"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sign out
      </DropdownMenuItem>
    </DropdownMenuContent>
</DropdownMenu>
      </div>
    </aside>
  );
}
