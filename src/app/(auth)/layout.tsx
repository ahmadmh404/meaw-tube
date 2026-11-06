<<<<<<< HEAD
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function AuthLayout({ children }: Props) {
  return (
=======
interface LayoutProps {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return ( 
>>>>>>> 7a447fe120c4e223cf4d15306c73f8e10a03464f
    <div className="min-h-screen flex items-center justify-center">
      {children}
    </div>
  );
}
<<<<<<< HEAD
=======
 
export default Layout;
>>>>>>> 7a447fe120c4e223cf4d15306c73f8e10a03464f
