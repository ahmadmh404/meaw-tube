import { HomeLayout } from "@/modules/home/ui/layouts//home-layout";

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  return <HomeLayout>{children}</HomeLayout>;
}
