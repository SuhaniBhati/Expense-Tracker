import React, { useContext, useState } from "react";
import { UserContext } from "../../context/userContext";
import Navbar from "./Navbar";
import SideMenu from "./SideMenu";

const DashboardLayout = ({ children, activeMenu }) => {
  const { user } = useContext(UserContext);

  // Desktop sidebar state
  // true  = sidebar visible
  // false = sidebar collapsed
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-app transition-colors duration-200">
      {/* Navbar */}
      <Navbar
        activeMenu={activeMenu}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {user && (
        <div>
          {/* =========================================================
              DESKTOP SIDEBAR
              =========================================================
              Fixed to the viewport so it does NOT scroll with the
              dashboard content.

              Navbar height is approximately 61px, so the sidebar
              starts directly below the navbar.
          */}
          <aside
            className={`
              hidden lg:block
              fixed
              left-0
              top-[61px]
              bottom-0
              z-30
              bg-nav
              border-r
              border-line
              overflow-hidden
              transition-all
              duration-300
              ease-in-out
              ${
                sidebarOpen
                  ? "w-64"
                  : "w-0 border-r-0"
              }
            `}
          >
            <div className="w-64 h-full">
              <SideMenu activeMenu={activeMenu} />
            </div>
          </aside>

          {/* =========================================================
              MAIN CONTENT
              =========================================================
              The left margin matches the sidebar width.

              When the sidebar is open:
                ml-64

              When collapsed:
                ml-0

              This prevents the fixed sidebar from covering the
              dashboard content.
          */}
          <main
            className={`
              w-full
              px-4
              md:px-6
              py-6
              transition-[margin]
              duration-300
              ease-in-out
              ${
                sidebarOpen
                  ? "lg:ml-64 lg:w-[calc(100%-16rem)]"
                  : "lg:ml-0 lg:w-full"
              }
            `}
          >
            <div className="max-w-7xl mx-auto w-full et-fade-in">
              {children}
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;