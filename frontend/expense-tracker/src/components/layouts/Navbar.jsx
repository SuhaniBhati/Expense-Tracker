import React, { useState, useContext } from "react";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { LuSunMedium, LuMoon } from "react-icons/lu";
import SideMenu from "./SideMenu";
import { useTheme } from "../../context/ThemeContext";
import { UserContext } from "../../context/userContext";
import CharAvatar from "../Cards/CharAvatar";

const Navbar = ({ activeMenu, sidebarOpen, setSidebarOpen }) => {
  // Mobile overlay has its own local state (defaults closed) — distinct
  // from the desktop `sidebarOpen` (defaults open), but the same button
  // toggles both since only one of the two is ever visible at a time.
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { user } = useContext(UserContext);

  const handleMenuButtonClick = () => {
    setMobileMenuOpen((prev) => !prev);
    setSidebarOpen((prev) => !prev);
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-line bg-nav/95 backdrop-blur-xl transition-colors duration-300">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <button
            className="et-icon-btn"
            onClick={handleMenuButtonClick}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen || sidebarOpen}
          >
            {mobileMenuOpen ? (
              <HiOutlineX className="text-[22px]" />
            ) : (
              <HiOutlineMenu className="text-[22px]" />
            )}
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-[var(--shadow-button)]">
              <span className="text-white text-base font-bold">₹</span>
            </div>

            <div className="hidden sm:block">
              <h2 className="text-[15px] font-bold text-ink leading-tight">
                Expense Tracker
              </h2>
              <p className="text-xs text-ink-muted">
                Smart finance management
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="et-icon-btn"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <LuSunMedium className="text-[18px]" />
            ) : (
              <LuMoon className="text-[18px]" />
            )}
          </button>

          {user?.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt="Profile"
              className="w-10 h-10 rounded-2xl object-cover border border-line shadow-[var(--shadow-card)]"
            />
          ) : (
            <CharAvatar
              fullName={user?.fullName}
              width="w-10"
              height="h-10"
              style="text-sm"
            />
          )}
        </div>
      </div>

      {/* MOBILE SIDEBAR (overlay) */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-72 h-full bg-surface shadow-[var(--shadow-elevated)] et-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <SideMenu activeMenu={activeMenu} />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;