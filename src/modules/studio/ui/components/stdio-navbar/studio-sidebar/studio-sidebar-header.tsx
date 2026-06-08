import { useUser } from "@clerk/nextjs";
import { SidebarHeader, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import Link from "next/link";
import { UserAvatar } from "@/components/user-avatar";
import { Skeleton } from "@/components/ui/skeleton";

export function StudioSidebarHeader() {
    const { user } = useUser()

    const { state } = useSidebar()

    if (!user) return (
        <SidebarHeader className="flex items-center justify-center py-4">
            <Skeleton className="size-28 rounded-full" />

            <div className="flex flex-col items-center mt-2 gap-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-30" />
            </div>
        </SidebarHeader>
    );


    if (state === 'collapsed') {
        return (
            <SidebarMenuItem>
                <SidebarMenuButton tooltip={"Your Profle"}>
                    <Link href={'/users/current'}>
                        <UserAvatar
                            imageUrl={user.imageUrl}
                            name={user.fullName ?? "User"}
                            size={'xs'}
                        />

                        <span className="text-sm">Your Profile</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        )
    }


    return <SidebarHeader className="flex items-center justify-center pb-4">
        <Link href={"/users/current"}>
            <UserAvatar
                imageUrl={user?.imageUrl}
                name={user?.fullName ?? "Name"}
                className="size-[112px] hover:opacity-80 transition-opacity"
            />
        </Link>

        <div className="flex flex-col items-center mt-2 gap-y-1">
            <p className="textssm font-medium">
                Your Profile
            </p>
            <p className="text-xs text-muted-foreground">
                {user.fullName}
            </p>
        </div>
    </SidebarHeader>
}