import { SidebarProvider } from "@/components/ui/sidebar";
import { StudioNavbar } from "../components/stdio-navbar";
import { StudioSidebar } from "../components/stdio-navbar/studio-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

interface Props {
    children: React.ReactNode;
}

export function StudioLayout({ children }: Props) {
    return (
        <SidebarProvider>
            <TooltipProvider>
                <div className="w-full">
                    <StudioNavbar />
                    <div className="flex min-h-screen pt-[4rem]">
                        <StudioSidebar />
                        <main className="flex-1 overflow-y-auto">{children}</main>
                    </div>
                </div>
            </TooltipProvider>
        </SidebarProvider>
    );
}
