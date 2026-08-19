import React from "react";
import { LuTrendingUpDown, LuShieldCheck, LuTrendingUp, LuWallet } from "react-icons/lu";

const AuthLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-950">
      {/* LEFT SECTION — Form */}
      <div className="w-full md:w-[55vw] min-h-screen flex flex-col px-8 sm:px-12 pt-8 pb-12">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white text-sm font-bold">₹</span>
          </div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Expense Tracker</h2>
        </div>

        {/* Form Content */}
        <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto">
          {children}
        </div>
      </div>

      {/* RIGHT SECTION — Decorative */}
      <div className="hidden md:flex w-[45vw] min-h-screen bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-[-60px] right-[-60px] w-64 h-64 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute bottom-[-60px] left-[-60px] w-80 h-80 rounded-full bg-purple-400/10 blur-3xl" />

        {/* Content */}
        <div className="relative z-10 text-center text-white">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6">
            <LuTrendingUpDown className="text-3xl" />
          </div>
          <h3 className="text-2xl font-bold mb-3">Track Your Finances</h3>
          <p className="text-purple-200 text-sm max-w-xs mx-auto leading-relaxed">
            Get full control over your income and expenses with beautiful analytics and smart insights.
          </p>

          {/* Feature Cards */}
          <div className="mt-10 space-y-3 text-left">
            {[
              { icon: <LuTrendingUp />, title: "Analytics & Charts", desc: "Visual spending insights" },
              { icon: <LuWallet />, title: "Budget Goals", desc: "Set & track monthly limits" },
              { icon: <LuShieldCheck />, title: "Secure & Private", desc: "JWT protected data" },
            ].map((feature) => (
              <div
                key={feature.title}
                className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold">{feature.title}</p>
                  <p className="text-xs text-purple-200">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Status et-card */}
          <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-400/20 flex items-center justify-center">
                <LuTrendingUpDown className="text-emerald-300" />
              </div>
              <div>
                <p className="text-xs text-purple-200">Track Your Income &amp; Expenses</p>
                <p className="text-lg font-bold">₹4,30,000</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;