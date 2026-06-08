import { StudioLayout } from "@/modules/studio/ui/layout/studio-layout";

interface Props {
    children: React.ReactNode;
}

export default function Layout({ children }: Props) {
    return <StudioLayout>{children}</StudioLayout>;
}
