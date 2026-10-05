import React from "react";
import {
  LuTrendingUpDown,
  LuShieldCheck,
  LuTrendingUp,
  LuWallet,
  LuMoon,
  LuSunMedium,
} from "react-icons/lu";
import { useTheme } from "../../context/ThemeContext";

const AuthLayout = ({ children }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="flex h-screen overflow-hidden bg-app">

      {/* LEFT SECTION — SCROLLABLE BUT SCROLLBAR HIDDEN */}
      <div className="w-full md:w-[55vw] h-screen overflow-y-auto no-scrollbar px-8 sm:px-12 pt-8 pb-12">

        {/* Logo + Theme Toggle */}
        <div className="flex items-center justify-between gap-2 mb-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white text-sm font-bold">₹</span>
            </div>

            <h2 className="text-base font-bold text-ink">
              Expense Tracker
            </h2>
          </div>

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
        </div>

        {/* Form Content */}
        <div className="min-h-[calc(100vh-100px)] flex flex-col justify-center max-w-md w-full mx-auto">
          {children}
        </div>
      </div>

      {/* RIGHT SECTION — DOES NOT SCROLL */}
      <div className="hidden md:flex w-[45vw] h-screen shrink-0 bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 flex-col items-center justify-center p-12 relative overflow-hidden">

        {/* Decorative blobs */}
        <div className="absolute top-[-60px] right-[-60px] w-64 h-64 rounded-full bg-white/5 blur-2xl" />

        <div className="absolute bottom-[-60px] left-[-60px] w-80 h-80 rounded-full bg-purple-400/10 blur-3xl" />

        {/* Content */}
        <div className="relative z-10 text-center text-white w-full">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6">
            <LuTrendingUpDown className="text-3xl" />
          </div>

          <h3 className="text-2xl font-bold mb-3">
            Track Your Finances
          </h3>

          <p className="text-purple-200 text-sm max-w-xs mx-auto leading-relaxed">
            Get full control over your income and expenses with beautiful
            analytics and smart insights.
          </p>

          {/* Feature Cards */}
          <div className="mt-3 space-y-2 text-left">
            {[
              {
                icon: <LuTrendingUp />,
                title: "Analytics & Charts",
                desc: "Visual spending insights",
              },
              {
                icon: <LuWallet />,
                title: "Budget Goals",
                desc: "Set & track monthly limits",
              },
              {
                icon: <LuShieldCheck />,
                title: "Secure & Private",
                desc: "JWT protected data",
              },
              {
                icon: <LuTrendingUpDown />,
                title: "Income & Expenses",
                desc: "Track all transactions",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg shrink-0">
                  {feature.icon}
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    {feature.title}
                  </p>

                  <p className="text-xs text-purple-200">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;