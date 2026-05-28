import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Sidebar from "../components/sidebar.jsx";

const GET_NOTIFICATIONS = gql`
  query {
    notifications {
      type
      title
      message
      severity
      createdAt
    }
  }
`;

function Notifications() {
  const { loading, error, data } = useQuery(GET_NOTIFICATIONS, {
    fetchPolicy: "network-only"
  });

  const notifications = Array.isArray(data?.notifications)
    ? data.notifications
    : [];

  const severityColor = {
    HIGH: "text-red-400 border-red-500",
    MEDIUM: "text-yellow-400 border-yellow-500",
    LOW: "text-green-400 border-green-500"
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-white flex">
      <Sidebar />

      <main className="flex-1 p-4 md:p-6 pt-20 md:pt-6">
        <h1 className="text-4xl font-bold text-orange-500">
          Notifications
        </h1>

        <p className="text-gray-400 mt-2">
          Alerts for stock, invoices, and active projects.
        </p>

        {loading && <p className="mt-8">Loading notifications...</p>}

        {error && (
          <p className="mt-8 text-red-400">
            {error.message}
          </p>
        )}

        {!loading && notifications.length === 0 && (
          <p className="mt-8 text-gray-400">
            No notifications yet.
          </p>
        )}

        <div className="space-y-4 mt-8">
          {notifications.map((item, index) => (
            <div
              key={index}
              className={`bg-[#161B22] border rounded-2xl p-5 ${
                severityColor[item.severity] || "border-gray-700"
              }`}
            >
              <div className="flex justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-400">
                    {item.type}
                  </p>

                  <h2 className="text-xl font-bold">
                    {item.title}
                  </h2>

                  <p className="text-gray-300 mt-2">
                    {item.message}
                  </p>
                </div>

                <span className="text-sm text-gray-500">
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString()
                    : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Notifications;