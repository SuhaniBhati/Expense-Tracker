
import { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import {
  LuWalletMinimal,
  LuHandCoins,
  LuTrendingUp,
  LuStar,
} from "react-icons/lu";

import { IoMdCard } from "react-icons/io";

import DashboardLayout from "../../components/layouts/DashboardLayout";

import InfoCard from "../../components/Cards/InfoCard";

import RecentTransactions from "../../components/Dashboard/RecentTransactions";

import CustomBarChart from "../../components/Charts/CustomBarChart";

import CustomPieChart from "../../components/Charts/CustomPieChart";

import axiosInstance from "../../utils/axiosInstance";

import { API_PATHS } from "../../utils/apiPaths";

import { useUserAuth } from "../../hooks/useUserAuth";

import {
  addThousandsSeparator,
  CATEGORY_COLORS,
} from "../../utils/helper";

const SkeletonCard = () => (
  <div className="et-skeleton h-28 rounded-3xl" />
);

const Home = () => {
  useUserAuth();

  const navigate = useNavigate();

  const [dashboardData, setDashboardData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const fetchDashboardData =
    async () => {
      setLoading(true);

      try {
        const response =
          await axiosInstance.get(
            API_PATHS.DASHBOARD.GET_DATA
          );

        if (response.data) {
          setDashboardData(
            response.data
          );
        }
      } catch (error) {
        toast.error(
          "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const topCategories =
    dashboardData?.categoryBreakdown?.slice(
      0,
      3
    ) || [];

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-ink">
              Dashboard
            </h1>

            <p className="text-sm text-ink-muted mt-1">
              Track your financial health with smart insights
            </p>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <InfoCard
                icon={<IoMdCard />}
                label="Total Balance"
                value={addThousandsSeparator(
                  dashboardData?.totalBalance ||
                    0
                )}
                color="bg-gradient-to-br from-violet-500 to-purple-700"
              />

              <InfoCard
                icon={<LuWalletMinimal />}
                label="Total Income"
                value={addThousandsSeparator(
                  dashboardData?.totalIncome ||
                    0
                )}
                color="bg-gradient-to-br from-emerald-400 to-green-600"
              />

              <InfoCard
                icon={<LuHandCoins />}
                label="Total Expenses"
                value={addThousandsSeparator(
                  dashboardData?.totalExpense ||
                    0
                )}
                color="bg-gradient-to-br from-rose-400 to-red-600"
              />
            </>
          )}
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          <div className="et-card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h5 className="text-lg font-semibold text-ink">
                  Income vs Expenses
                </h5>

                <p className="text-xs text-ink-muted mt-1">
                  Last 6 months overview
                </p>
              </div>
            </div>

            {loading ? (
              <div className="et-skeleton h-[320px] rounded-2xl" />
            ) : (
              <CustomBarChart
                data={
                  dashboardData?.monthlyData ||
                  []
                }
              />
            )}
          </div>

          <div className="et-card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h5 className="text-lg font-semibold text-ink">
                  Expense Categories
                </h5>

                <p className="text-xs text-ink-muted mt-1">
                  Spending distribution
                </p>
              </div>
            </div>

            {loading ? (
              <div className="et-skeleton h-[320px] rounded-2xl" />
            ) : (
              <CustomPieChart
                data={
                  dashboardData?.categoryBreakdown ||
                  []
                }
              />
            )}
          </div>
        </div>

        {/* LOWER GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* TRANSACTIONS */}
          <div className="xl:col-span-2">
            {loading ? (
              <div className="et-card space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="et-skeleton h-16 rounded-2xl"
                  />
                ))}
              </div>
            ) : (
              <RecentTransactions
                transactions={
                  dashboardData?.recentTransactions
                }
                onSeeMore={() =>
                  navigate("/expense")
                }
              />
            )}
          </div>

          {/* TOP CATEGORIES */}
          <div className="et-card">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-warning-soft flex items-center justify-center">
                <LuStar className="text-warning text-lg" />
              </div>

              <div>
                <h5 className="text-lg font-semibold text-ink">
                  Top Categories
                </h5>

                <p className="text-xs text-ink-muted">
                  Highest spending areas
                </p>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="et-skeleton h-16 rounded-2xl"
                  />
                ))}
              </div>
            ) : topCategories.length >
              0 ? (
              <div className="space-y-5">
                {topCategories.map(
                  (cat, index) => {
                    const total =
                      dashboardData?.totalExpense ||
                      1;

                    const pct =
                      Math.round(
                        (cat.amount /
                          total) *
                          100
                      );

                    const color =
                      CATEGORY_COLORS[
                        cat.name
                      ] || "#875cf5";

                    return (
                      <div
                        key={index}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-ink truncate">
                            {cat.name}
                          </span>

                          <span className="text-xs text-ink-muted">
                            {pct}%
                          </span>
                        </div>

                        <div className="h-3 bg-line-subtle rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${pct}%`,
                              backgroundColor:
                                color,
                            }}
                          />
                        </div>

                        <p className="text-xs text-ink-muted mt-1.5">
                          ₹
                          {addThousandsSeparator(
                            cat.amount
                          )}
                        </p>
                      </div>
                    );
                  }
                )}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-sm text-ink-faint">
                  No expense data available
                </p>
              </div>
            )}
          </div>
        </div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "30 Days",
              sublabel: "Expenses",
              value:
                dashboardData
                  ?.last30DaysExpense
                  ?.total || 0,
              color: "text-danger",
              bg: "bg-danger-soft",
              icon: <LuHandCoins />,
            },
            {
              label: "60 Days",
              sublabel: "Income",
              value:
                dashboardData
                  ?.last60DaysIncome
                  ?.total || 0,
              color:
                "text-success",
              bg: "bg-success-soft",
              icon: <LuWalletMinimal />,
            },
            {
              label: "Recent",
              sublabel: "Transactions",
              value:
                dashboardData
                  ?.recentTransactions
                  ?.length || 0,
              isCount: true,
              color:
                "text-primary",
              bg: "bg-primary-soft",
              icon: <LuTrendingUp />,
            },
            {
              label: "Active",
              sublabel: "Categories",
              value:
                dashboardData
                  ?.categoryBreakdown
                  ?.length || 0,
              isCount: true,
              color:
                "text-warning",
              bg: "bg-warning-soft",
              icon: <LuStar />,
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`${stat.bg} rounded-3xl p-5 border border-line-subtle transition-all duration-200 hover:-translate-y-1`}
            >
              <div className="text-2xl mb-3">
                <span className={stat.color}>
                  {stat.icon}
                </span>
              </div>

              <p className="text-xs text-ink-muted">
                {stat.sublabel}
              </p>

              <p
                className={`text-lg font-bold mt-1 ${stat.color}`}
              >
                {stat.isCount
                  ? stat.value
                  : `₹${addThousandsSeparator(
                      stat.value
                    )}`}
              </p>

              <p className="text-xs text-ink-faint mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Home;