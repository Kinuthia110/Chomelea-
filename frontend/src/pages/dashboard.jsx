import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import {
  FaUsers,
  FaProjectDiagram,
  FaFileInvoice,
  FaMoneyBillWave,
  FaBoxOpen,
  FaSignOutAlt,
  FaChartLine,
  FaDownload
} from "react-icons/fa";

import Sidebar from "../components/sidebar.jsx";
import Card from "../components/ui/Card.jsx";
import Loading from "../components/ui/Loading.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";

const DASHBOARD_QUERY = gql`
  query {
    revenueSummary {
      totalInvoiceValue
      totalRevenueReceived
      outstandingBalance
      paidInvoices
      partialInvoices
      unpaidInvoices
    }

    dashboardStats {
      totalCustomers
      totalProjects
      activeProjects
      completedProjects
      totalQuotations
      approvedQuotations
      totalInvoices
      totalPayments
      lowStockCount
    }

    monthlyRevenue {
      month
      invoiceValue
      revenueReceived
      outstandingBalance
    }

    projectStatusCounts {
      status
      count
    }

    topCustomers {
      customerName
      totalSpent
      invoiceCount
    }

    lowStockItems {
      itemName
      quantity
      unit
      minimumStockLevel
    }

    kpiGrowth {
      revenueGrowth
      invoiceGrowth
      paymentGrowth
      outstandingGrowth
      currentRevenue
      previousRevenue
      currentInvoiceValue
      previousInvoiceValue
      currentPayments
      previousPayments
      currentOutstanding
      previousOutstanding
    }

    revenueForecast {
      nextMonthForecast
      averageMonthlyRevenue
      bestMonthRevenue
      worstMonthRevenue
    }

    analyticsReport {
      totalRevenue
      totalInvoices
      totalPayments
      outstandingBalance
      lowStockCount
      generatedAt
    }

    recentActivities {
      type
      title
      description
      createdAt
    }
  }
`;

const money = (value) =>
  `KES ${Number(value || 0).toLocaleString()}`;

function GrowthBadge({ value = 0 }) {
  const positive = Number(value) >= 0;

  return (
    <span
      className={`text-xs font-bold px-2 py-1 rounded-full ${
        positive
          ? "bg-green-500/10 text-green-400"
          : "bg-red-500/10 text-red-400"
      }`}
    >
      {positive ? "+" : ""}
      {value}%
    </span>
  );
}

function StatCard({ title, value, icon, growth, color = "text-orange-500" }) {
  return (
    <Card className="hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>

          <h2 className="text-2xl md:text-3xl font-bold mt-2">
            {value}
          </h2>

          {growth !== undefined && (
            <div className="mt-3">
              <GrowthBadge value={growth} />
            </div>
          )}
        </div>

        <div className={`${color} text-3xl`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

function Dashboard() {
  const navigate = useNavigate();

  const { loading, error, data } = useQuery(DASHBOARD_QUERY, {
    fetchPolicy: "network-only"
  });

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const revenue = data?.revenueSummary || {};
  const stats = data?.dashboardStats || {};
  const kpi = data?.kpiGrowth || {};
  const forecast = data?.revenueForecast || {};
  const report = data?.analyticsReport || {};

  const monthly = Array.isArray(data?.monthlyRevenue)
    ? data.monthlyRevenue
    : [];

  const projectStatus = Array.isArray(data?.projectStatusCounts)
    ? data.projectStatusCounts
    : [];

  const topCustomers = Array.isArray(data?.topCustomers)
    ? data.topCustomers
    : [];

  const lowStockItems = Array.isArray(data?.lowStockItems)
    ? data.lowStockItems
    : [];

  const activities = Array.isArray(data?.recentActivities)
    ? data.recentActivities
    : [];

  const invoiceStatusData = [
    { name: "Paid", value: revenue.paidInvoices || 0 },
    { name: "Partial", value: revenue.partialInvoices || 0 },
    { name: "Unpaid", value: revenue.unpaidInvoices || 0 }
  ];

  const downloadCSV = () => {
    const rows = [
      ["Metric", "Value"],
      ["Total Revenue", report.totalRevenue || 0],
      ["Total Invoices", report.totalInvoices || 0],
      ["Total Payments", report.totalPayments || 0],
      ["Outstanding Balance", report.outstandingBalance || 0],
      ["Low Stock Count", report.lowStockCount || 0],
      ["Generated At", report.generatedAt || new Date().toISOString()]
    ];

    const csv = rows.map((row) => row.join(",")).join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "chomelea-analytics-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const printPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-white flex">
      <Sidebar />

      <main className="flex-1 p-4 md:p-6 pt-20 md:pt-6 overflow-x-hidden">
        <header className="bg-gradient-to-r from-[#161B22] to-[#1F2937] border border-gray-800 rounded-2xl p-5 flex flex-col md:flex-row gap-4 md:items-center md:justify-between shadow-lg shadow-black/20">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-orange-500">
              CHOMELEA Analytics
            </h1>

            <p className="text-gray-400 mt-1">
              Real-time KPIs, forecasting, stock alerts, and business performance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={downloadCSV}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-bold transition-all"
            >
              <FaDownload />
              CSV
            </button>

            <button
              onClick={printPDF}
              className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg font-bold transition-all"
            >
              <FaDownload />
              PDF
            </button>

            <button
              onClick={logout}
              className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-bold transition-all"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </header>

        {loading && (
          <div className="mt-6 space-y-4">
            <Loading text="Loading dashboard analytics..." />
            <Loading text="Preparing KPI cards..." />
          </div>
        )}

        {error && (
          <Card className="mt-6 border-red-500 bg-red-500/10">
            <h2 className="text-red-400 font-bold text-xl">
              Dashboard Error
            </h2>
            <p className="text-red-300 mt-2">
              {error.message}
            </p>
          </Card>
        )}

        {!loading && !error && (
          <>
            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mt-6">
              <StatCard
                title="Revenue This Month"
                value={money(kpi.currentRevenue)}
                icon={<FaMoneyBillWave />}
                growth={kpi.revenueGrowth}
                color="text-green-400"
              />

              <StatCard
                title="Invoice Value"
                value={money(kpi.currentInvoiceValue)}
                icon={<FaFileInvoice />}
                growth={kpi.invoiceGrowth}
              />

              <StatCard
                title="Payments"
                value={money(kpi.currentPayments)}
                icon={<FaChartLine />}
                growth={kpi.paymentGrowth}
                color="text-blue-400"
              />

              <StatCard
                title="Outstanding"
                value={money(kpi.currentOutstanding)}
                icon={<FaBoxOpen />}
                growth={kpi.outstandingGrowth}
                color="text-yellow-400"
              />
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mt-6">
              <StatCard
                title="Total Customers"
                value={stats.totalCustomers || 0}
                icon={<FaUsers />}
              />

              <StatCard
                title="Active Projects"
                value={stats.activeProjects || 0}
                icon={<FaProjectDiagram />}
                color="text-blue-400"
              />

              <StatCard
                title="Total Invoices"
                value={stats.totalInvoices || 0}
                icon={<FaFileInvoice />}
              />

              <StatCard
                title="Low Stock Items"
                value={stats.lowStockCount || 0}
                icon={<FaBoxOpen />}
                color="text-red-400"
              />
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mt-6">
              <Card>
                <p className="text-gray-400 text-sm">
                  Next Month Forecast
                </p>
                <h2 className="text-2xl font-bold text-green-400 mt-2">
                  {money(forecast.nextMonthForecast)}
                </h2>
              </Card>

              <Card>
                <p className="text-gray-400 text-sm">
                  Avg Monthly Revenue
                </p>
                <h2 className="text-2xl font-bold mt-2">
                  {money(forecast.averageMonthlyRevenue)}
                </h2>
              </Card>

              <Card>
                <p className="text-gray-400 text-sm">
                  Best Month
                </p>
                <h2 className="text-2xl font-bold text-orange-500 mt-2">
                  {money(forecast.bestMonthRevenue)}
                </h2>
              </Card>

              <Card>
                <p className="text-gray-400 text-sm">
                  Worst Month
                </p>
                <h2 className="text-2xl font-bold text-red-400 mt-2">
                  {money(forecast.worstMonthRevenue)}
                </h2>
              </Card>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
              <Card className="min-h-[380px]">
                <h2 className="text-2xl font-bold mb-4">
                  Monthly Revenue
                </h2>

                {monthly.length === 0 ? (
                  <EmptyState
                    title="No revenue data"
                    message="Create invoices and record payments to view monthly analytics."
                  />
                ) : (
                  <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthly}>
                        <XAxis dataKey="month" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip />
                        <Bar dataKey="invoiceValue" fill="#F97316" />
                        <Bar dataKey="revenueReceived" fill="#22C55E" />
                        <Bar dataKey="outstandingBalance" fill="#EF4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>

              <Card className="min-h-[380px]">
                <h2 className="text-2xl font-bold mb-4">
                  Revenue Trend
                </h2>

                {monthly.length === 0 ? (
                  <EmptyState
                    title="No trend data"
                    message="Revenue trend will appear after invoices and payments are recorded."
                  />
                ) : (
                  <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthly}>
                        <XAxis dataKey="month" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="revenueReceived"
                          stroke="#F97316"
                          strokeWidth={3}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
              <Card className="min-h-[380px]">
                <h2 className="text-2xl font-bold mb-4">
                  Invoice Status
                </h2>

                {invoiceStatusData.every((item) => item.value === 0) ? (
                  <EmptyState
                    title="No invoice status yet"
                    message="Invoice status chart appears after invoices are created."
                  />
                ) : (
                  <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={invoiceStatusData}
                          dataKey="value"
                          nameKey="name"
                          outerRadius={100}
                          label
                        >
                          <Cell fill="#22C55E" />
                          <Cell fill="#FACC15" />
                          <Cell fill="#EF4444" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>

              <Card>
                <h2 className="text-2xl font-bold mb-4">
                  Project Status
                </h2>

                {projectStatus.length === 0 ? (
                  <EmptyState
                    title="No project data"
                    message="Create projects to track progress status."
                  />
                ) : (
                  <div className="space-y-3">
                    {projectStatus.map((item) => (
                      <div
                        key={item.status}
                        className="bg-[#0D1117] border border-gray-800 p-4 rounded-xl flex justify-between"
                      >
                        <span>{item.status}</span>
                        <span className="font-bold text-orange-500">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
              <Card>
                <h2 className="text-2xl font-bold mb-4">
                  Top Customers
                </h2>

                {topCustomers.length === 0 ? (
                  <EmptyState
                    title="No customer spending data"
                    message="Customer rankings will appear after invoices and payments are recorded."
                  />
                ) : (
                  <div className="space-y-3">
                    {topCustomers.map((customer, index) => (
                      <div
                        key={index}
                        className="bg-[#0D1117] border border-gray-800 p-4 rounded-xl flex justify-between items-center"
                      >
                        <div>
                          <h3 className="font-semibold">
                            {customer.customerName}
                          </h3>

                          <p className="text-gray-400 text-sm">
                            {customer.invoiceCount} invoices
                          </p>
                        </div>

                        <span className="font-bold text-green-400">
                          {money(customer.totalSpent)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card>
                <h2 className="text-2xl font-bold mb-4">
                  Low Stock Alert
                </h2>

                {lowStockItems.length === 0 ? (
                  <EmptyState
                    title="Inventory healthy"
                    message="No items are currently below minimum stock."
                  />
                ) : (
                  <div className="space-y-3">
                    {lowStockItems.map((item, index) => (
                      <div
                        key={index}
                        className="bg-[#0D1117] border border-red-900 p-4 rounded-xl flex justify-between"
                      >
                        <div>
                          <h3 className="font-semibold">
                            {item.itemName}
                          </h3>

                          <p className="text-gray-400 text-sm">
                            Minimum: {item.minimumStockLevel}
                          </p>
                        </div>

                        <span className="font-bold text-red-400">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </section>

            <Card className="mt-6">
              <h2 className="text-2xl font-bold mb-4">
                Recent Activity
              </h2>

              {activities.length === 0 ? (
                <EmptyState
                  title="No activity yet"
                  message="Recent projects, invoices, and payments will appear here."
                />
              ) : (
                <div className="space-y-3">
                  {activities.map((activity, index) => (
                    <div
                      key={`${activity.type}-${index}`}
                      className="bg-[#0D1117] border border-gray-800 p-4 rounded-xl"
                    >
                      <div className="flex flex-col md:flex-row md:justify-between gap-4">
                        <div>
                          <p className="font-bold text-orange-500">
                            {activity.type}
                          </p>

                          <h3 className="font-semibold">
                            {activity.title}
                          </h3>

                          <p className="text-gray-400 text-sm">
                            {activity.description}
                          </p>
                        </div>

                        <p className="text-gray-500 text-sm">
                          {activity.createdAt
                            ? new Date(activity.createdAt).toLocaleDateString()
                            : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;