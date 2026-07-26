import { HomeLayout } from "@/modules/home/ui/layouts//home-layout";
import { connection } from "next/server";

interface Props {
  children: React.ReactNode;
}

export default async function Layout({ children }: Props) {
  await connection();

  return <HomeLayout>{children}</HomeLayout>;
}
