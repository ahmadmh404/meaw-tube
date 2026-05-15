import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { MainSection } from "./main-section";
import { Separator } from "@/components/ui/separator";
import { PersonalSection } from "./personal-section";

export function HomeSidebar() {
  return (
    <Sidebar collapsible="icon" className="pt-16 z-40 border-none">
      <SidebarContent className="bg-background">
        {/* Main Section */}
        <MainSection />

        <Separator />

        {/* Personal Section */}
        <PersonalSection />
      </SidebarContent>
    </Sidebar>
  );
}
