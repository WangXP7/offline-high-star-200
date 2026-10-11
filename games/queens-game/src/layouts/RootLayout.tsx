import Footer from "../components/Footer";
import { Analytics } from "@vercel/analytics/react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

interface RootLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const RootLayout = ({ children, className = "" }: RootLayoutProps) => {
  return (
    <div
      className={`flex flex-col h-full overflow-clip pb-4 min-h-screen ${className}`}
    >
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-h-[300px] mb-3 pb-16 mx-auto lg:pl-44">
          <Navbar />
          {children}
        </div>
      </div>
      <Footer />
      <Analytics />
    </div>
  );
};

export default RootLayout;
