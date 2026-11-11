
import { Separator } from "@/components/ui/separator"
import { Sidebar, SidebarContent } from "@/components/ui/sidebar"

import { MainSection } from "./main-section"
import { PersonalSection } from "./personal-section"
import { SubscriptionsSection } from "./subscriptions-section"
import { auth } from "@clerk/nextjs/server"

export async function HomeSidebar()  {
  const {userId} = await auth();

  return (
    <Sidebar className="pt-16 z-40 border-none" collapsible="icon">
      <SidebarContent className="bg-background">
        <MainSection />
        <Separator />
        <PersonalSection />

        {userId && (
          <>
            <Separator />
            <SubscriptionsSection />
          </>
        )}

      </SidebarContent>
    </Sidebar>
  )
}