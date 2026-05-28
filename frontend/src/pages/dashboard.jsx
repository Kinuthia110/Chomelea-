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
  FaSignOutAlt
} from "react-icons/fa";

import Sidebar from "../components/sidebar.jsx";

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

    recentActivities {
      type
      title
      description
      createdAt
    }
  }
`;

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-[#161B22] border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400">{title}</p>
          <h2 className="text-3xl font-bold mt-2">{value}</h2>
        </div>

        <div className="text-orange-500 text-3xl">{icon}</div>
      </div>
    </div>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1117] text-white flex">
        <Sidebar />
        <main className="flex-1 p-6">Loading analytics...</main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0D1117] text-white flex">
        <Sidebar />
        <main className="flex-1 p-6 text-red-400">{error.message}</main>
      </div>
    );
  }

  const revenue = data?.revenueSummary || {};
  const stats = data?.dashboardStats || {};
  const monthly = Array.isArray(data?.monthlyRevenue) ? data.monthlyRevenue : [];
  const projectStatus = Array.isArray(data?.projectStatusCounts)
    ? data.projectStatusCounts
    : [];
  const activities = Array.isArray(data?.recentActivities)
    ? data.recentActivities
    : [];

  const invoiceStatusData = [
    { name: "Paid", value: revenue.paidInvoices || 0 },
    { name: "Partial", value: revenue.partialInvoices || 0 },
    { name: "Unpaid", value: revenue.unpaidInvoices || 0 }
  ];

  return (
    <div className="min-h-screen bg-[#0D1117] text-white flex">
      <Sidebar />

      <main className="flex-1 p-4 md:p-6 pt-20 md:pt-6 overflow-x-hidden">
        <header className="bg-[#161B22] border border-gray-800 rounded-2xl p-5 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-orange-500">
              CHOMELEA Analytics
            </h1>
            <p className="text-gray-400 mt-1">
              Real-time welding business performance.
            </p>
          </div>

          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mt-6">
          <StatCard
            title="Revenue Received"
            value={`KES ${revenue.totalRevenueReceived || 0}`}
            icon={<FaMoneyBillWave />}
          />

          <StatCard
            title="Invoice Value"
            value={`KES ${revenue.totalInvoiceValue || 0}`}
            icon={<FaFileInvoice />}
          />

          <StatCard
            title="Outstanding Balance"
            value={`KES ${revenue.outstandingBalance || 0}`}
            icon={<FaBoxOpen />}
          />

          <StatCard
            title="Customers"
            value={stats.totalCustomers || 0}
            icon={<FaUsers />}
          />
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mt-6">
          <StatCard
            title="Projects"
            value={stats.totalProjects || 0}
            icon={<FaProjectDiagram />}
          />

          <StatCard
            title="Active Projects"
            value={stats.activeProjects || 0}
            icon={<FaProjectDiagram />}
          />

          <StatCard
            title="Invoices"
            value={stats.totalInvoices || 0}
            icon={<FaFileInvoice />}
          />

          <StatCard
            title="Low Stock Items"
            value={stats.lowStockCount || 0}
            icon={<FaBoxOpen />}
          />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
          <div className="bg-[#161B22] border border-gray-800 rounded-2xl p-6 min-h-[380px]">
            <h2 className="text-2xl font-bold mb-4">Monthly Revenue</h2>

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
          </div>

          <div className="bg-[#161B22] border border-gray-800 rounded-2xl p-6 min-h-[380px]">
            <h2 className="text-2xl font-bold mb-4">Revenue Trend</h2>

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
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
          <div className="bg-[#161B22] border border-gray-800 rounded-2xl p-6 min-h-[380px]">
            <h2 className="text-2xl font-bold mb-4">Invoice Status</h2>

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
          </div>

          <div className="bg-[#161B22] border border-gray-800 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">Project Status</h2>

            {projectStatus.length === 0 ? (
              <p className="text-gray-400">No project data yet.</p>
            ) : (
              <div className="space-y-3">
                {projectStatus.map((item) => (
                  <div
                    key={item.status}
                    className="bg-[#0D1117] p-4 rounded-xl flex justify-between"
                  >
                    <span>{item.status}</span>
                    <span className="font-bold text-orange-500">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="bg-[#161B22] border border-gray-800 rounded-2xl p-6 mt-6">
          <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>

          {activities.length === 0 ? (
            <p className="text-gray-400">No recent activity yet.</p>
          ) : (
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <div
                  key={`${activity.type}-${index}`}
                  className="bg-[#0D1117] p-4 rounded-xl"
                >
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="font-bold text-orange-500">
                        {activity.type}
                      </p>
                      <h3 className="font-semibold">{activity.title}</h3>
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
        </section>
      </main>
    </div>
  );
}

export default Dashboard;