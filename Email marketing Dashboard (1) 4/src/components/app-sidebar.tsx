import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, BarChart3, ShieldCheck, Sparkles, MousePointerClick, BookOpen, Wand2, Palette } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  { title: "Overview", url: "/", icon: LayoutDashboard },
  { title: "Campaigns", url: "/campaigns", icon: BarChart3 },
  { title: "Deliverability", url: "/deliverability", icon: ShieldCheck },
  { title: "Engagement", url: "/engagement", icon: MousePointerClick },
  { title: "AI Insights", url: "/insights", icon: Sparkles },
  { title: "The Playbook", url: "/playbook", icon: BookOpen },
  { title: "Cheat Codes", url: "/write", icon: Wand2 },
  { title: "Brand Guide", url: "/brand", icon: Palette },
];

export function AppSidebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-medium"
            style={{
              backgroundColor: "#6B4C4C",
              color: "#F9F5F1",
              fontFamily: "'Playfair Display', serif",
              fontWeight: 400,
              letterSpacing: "-0.02em",
            }}
          >
            L
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span
              className="text-[13px] font-medium"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "#2A1F1A" }}
            >
              Lyzr Email
            </span>
            <span
              className="text-[11px]"
              style={{ color: "#7A6A60", fontFamily: "'DM Sans', sans-serif" }}
            >
              Growth Intelligence
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={path === item.url} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
