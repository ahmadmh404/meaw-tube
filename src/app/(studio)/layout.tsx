import { StudioLayout } from "@/modules/studio/ui/layout/studio-layout";
import { connection } from "next/server";

interface Props {
  children: React.ReactNode;
}

export default async function Layout({ children }: Props) {
  await connection();

  return <StudioLayout>{children}</StudioLayout>;
}
