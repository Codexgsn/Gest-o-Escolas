
"use client";

import {
  Building,
  CalendarDays,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import { Logo } from "./logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useLayoutStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const allMenuItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Painel", adminOnly: false },
  { href: "/dashboard/reservations", icon: CalendarDays, label: "Reservas", adminOnly: false },
  { href: "/dashboard/resources", icon: Building, label: "Recursos", adminOnly: false },
  { href: "/dashboard/users", icon: Users, label: "Usuários", adminOnly: true },
  { href: "/dashboard/settings", icon: Settings, label: "Configurações", adminOnly: true },
];

export default function AppSidebar({ userRole }: { userRole?: string }) {
  const pathname = usePathname();
  const state = useLayoutStore((s) => s.getState());

  const menuItems = allMenuItems.filter(item => !item.adminOnly || userRole === 'Admin');

  return (
    <Sidebar className="border-r border-sidebar-border/50 bg-sidebar-background/80 backdrop-blur-xl">
      <SidebarHeader className="py-6 px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-transparent">
            <Logo className="h-10 w-10" />
          </div>
          <div className={cn("flex flex-col transition-opacity duration-300", { 'opacity-0 sr-only': state === 'collapsed' })}>
            <span className="text-sm font-bold tracking-tight text-foreground">Gestão Escolar</span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Portal Administrativo</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarMenu className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              tooltip={item.label}
              className={cn(
                "w-full h-11 transition-all duration-200 hover:bg-sidebar-accent/50 rounded-lg group",
                {
                  "bg-primary/10 text-primary hover:bg-primary/15 font-semibold": pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard'),
                }
              )}
              isActive={pathname === item.href}
            >
              <Link href={item.href} className="flex items-center gap-3">
                <item.icon className={cn(
                  "h-5 w-5 transition-colors shrink-0",
                  pathname === item.href ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )} />
                <span className={cn("text-sm transition-opacity duration-300", { "opacity-0 sr-only": state === "collapsed" })}>
                  {item.label}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <SidebarFooter>
      </SidebarFooter>
    </Sidebar>
  );
}
