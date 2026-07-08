import { HomeNavbar } from "../components/home-navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HomeSidebar } from "../components/home-navbar/home-sidebar";

interface Props {
  children: React.ReactNode;
}

export function HomeLayout({ children }: Props) {
  return (
    <SidebarProvider>
      <TooltipProvider>
        <div className="w-full">
          <HomeNavbar />
          <div className="flex min-h-screen pt-[4rem]">
            <HomeSidebar />
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
        </div>
      </TooltipProvider>
    </SidebarProvider>
  );
}
