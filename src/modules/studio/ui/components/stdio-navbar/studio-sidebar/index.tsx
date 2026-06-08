'use client'

import { Sidebar, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarSeparator } from "@/components/ui/sidebar";
import Link from "next/link";
import { LogOutIcon, VideoIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { StudioSidebarHeader } from "./studio-sidebar-header";

export function StudioSidebar() {
  const pathname = usePathname();
  const isActive = pathname === '/studio'

  return (
    <Sidebar collapsible="icon" className="pt-16 z-40">
      <SidebarContent className="bg-background">
        <StudioSidebarHeader />


        {/* Personal Section */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={isActive}
                tooltip={"Exit Studio"} asChild>
                <Link href={'/studio/videos'}>
                  <VideoIcon className="size-4" />
                  <span className="text-sm">Content</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarSeparator />

            <SidebarMenuItem>
              <SidebarMenuButton tooltip={"Exit Studio"} asChild>
                <Link href={'/'}>
                  <LogOutIcon className="size-4" />
                  <span className="text-sm">Exit Studio</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar >
  );
}
