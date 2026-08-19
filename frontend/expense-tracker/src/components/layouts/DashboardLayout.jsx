import React, { useContext } from "react";
import { UserContext } from "../../context/userContext";
import Navbar from "./Navbar";
import SideMenu from "./SideMenu";

const DashboardLayout = ({ children, activeMenu }) => {
  const { user } = useContext(UserContext);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-200">
      <Navbar activeMenu={activeMenu} />

      {user && (
        <div className="flex">
          {/* Sidebar — hidden on mobile, visible from lg */}
          <div className="hidden lg:block">
            <SideMenu activeMenu={activeMenu} />
          </div>

          {/* Main content */}
          <main className="flex-1 px-4 md:px-6 py-6 max-w-7xl mx-auto w-full animate-fadeIn">
            {children}
          </main>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;