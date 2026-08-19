import React, { useState, useContext } from "react";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { LuSunMedium, LuMoon } from "react-icons/lu";
import SideMenu from "./SideMenu";
import { useTheme } from "../../context/ThemeContext";
import { UserContext } from "../../context/userContext";
import CharAvatar from "../Cards/CharAvatar";

const Navbar = ({ activeMenu }) => {
  const [openSideMenu, setOpenSideMenu] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { user } = useContext(UserContext);

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-100 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/90 backdrop-blur-xl transition-all duration-300">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary hover:bg-violet-50 dark:hover:bg-slate-800 transition-all duration-200"
            onClick={() => setOpenSideMenu(!openSideMenu)}
            aria-label="Toggle menu"
          >
            {openSideMenu ? (
              <HiOutlineX className="text-[22px]" />
            ) : (
              <HiOutlineMenu className="text-[22px]" />
            )}
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-md shadow-violet-500/20">
              <span className="text-white text-base font-bold">₹</span>
            </div>

            <div className="hidden sm:block">
              <h2 className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight">
                Expense Tracker
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Smart finance management
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary hover:bg-violet-50 dark:hover:bg-slate-800 transition-all duration-200 shadow-sm"
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
              className="w-10 h-10 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
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

      {/* MOBILE SIDEBAR */}
      {openSideMenu && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] lg:hidden"
          onClick={() => setOpenSideMenu(false)}
        >
          <div
            className="w-72 h-full bg-white dark:bg-slate-950 shadow-2xl et-slide-in"
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