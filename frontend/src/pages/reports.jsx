import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Sidebar from "../components/sidebar.jsx";

const REPORTS_QUERY = gql`
  query {
    revenueSummary {
      totalInvoiceValue
      totalRevenueReceived
      outstandingBalance
      paidInvoices
      partialInvoices
      unpaidInvoices
    }

    monthlyRevenue {
      month
      invoiceValue
      revenueReceived
      outstandingBalance
    }

    lowStockItems {
      id
      itemName
      quantity
      minimumStockLevel
      unit
    }
  }
`;

function Reports() {
  const { loading, error, data } = useQuery(REPORTS_QUERY, {
    fetchPolicy: "network-only"
  });

  const revenue = data?.revenueSummary || {};
  const monthly = Array.isArray(data?.monthlyRevenue) ? data.monthlyRevenue : [];
  const lowStock = Array.isArray(data?.lowStockItems) ? data.lowStockItems : [];

  return (
    <div className="min-h-screen bg-[#0D1117] text-white flex">
      <Sidebar />

     <main className="flex-1 p-4 md:p-6 pt-20 md:pt-6 overflow-x-hidden">
        <h1 className="text-4xl font-bold text-orange-500">
          Reports
        </h1>

        <p className="text-gray-400 mt-2">
          Business performance and operations summary.
        </p>

        {loading && (
          <p className="mt-8 text-gray-400">
            Loading reports...
          </p>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-300 p-4 rounded-xl mt-6">
            <h2 className="font-bold">Reports Query Error</h2>
            <p>{error.message}</p>
          </div>
        )}

        {!loading && !error && (
          <>
           <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              <div className="bg-[#161B22] border border-gray-800 rounded-2xl p-6">
                <p className="text-gray-400">Invoice Value</p>
                <h2 className="text-3xl font-bold mt-2">
                  KES {revenue.totalInvoiceValue || 0}
                </h2>
              </div>

              <div className="bg-[#161B22] border border-gray-800 rounded-2xl p-6">
                <p className="text-gray-400">Revenue Received</p>
                <h2 className="text-3xl font-bold mt-2">
                  KES {revenue.totalRevenueReceived || 0}
                </h2>
              </div>

              <div className="bg-[#161B22] border border-gray-800 rounded-2xl p-6">
                <p className="text-gray-400">Outstanding Balance</p>
                <h2 className="text-3xl font-bold mt-2">
                  KES {revenue.outstandingBalance || 0}
                </h2>
              </div>
            </div>

            <section className="bg-[#161B22] border border-gray-800 rounded-2xl p-6 mt-8">
              <h2 className="text-2xl font-bold mb-4">
                Invoice Summary
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#0D1117] p-4 rounded-xl">
                  <p className="text-gray-400">Paid</p>
                  <h3 className="text-2xl font-bold text-green-400">
                    {revenue.paidInvoices || 0}
                  </h3>
                </div>

                <div className="bg-[#0D1117] p-4 rounded-xl">
                  <p className="text-gray-400">Partial</p>
                  <h3 className="text-2xl font-bold text-yellow-400">
                    {revenue.partialInvoices || 0}
                  </h3>
                </div>

                <div className="bg-[#0D1117] p-4 rounded-xl">
                  <p className="text-gray-400">Unpaid</p>
                  <h3 className="text-2xl font-bold text-red-400">
                    {revenue.unpaidInvoices || 0}
                  </h3>
                </div>
              </div>
            </section>

            <section className="bg-[#161B22] border border-gray-800 rounded-2xl p-6 mt-8">
              <h2 className="text-2xl font-bold mb-4">
                Monthly Revenue
              </h2>

              {monthly.length === 0 ? (
                <p className="text-gray-400">
                  No monthly revenue data yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-[8000px] w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400">
                        <th className="py-3">Month</th>
                        <th>Invoice Value</th>
                        <th>Revenue Received</th>
                        <th>Outstanding</th>
                      </tr>
                    </thead>

                    <tbody>
                      {monthly.map((item) => (
                        <tr
                          key={item.month}
                          className="border-b border-gray-800"
                        >
                          <td className="py-3">{item.month}</td>
                          <td>KES {item.invoiceValue || 0}</td>
                          <td>KES {item.revenueReceived || 0}</td>
                          <td>KES {item.outstandingBalance || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="bg-[#161B22] border border-gray-800 rounded-2xl p-6 mt-8">
              <h2 className="text-2xl font-bold mb-4">
                Low Stock Report
              </h2>

              {lowStock.length === 0 ? (
                <p className="text-gray-400">
                  No low stock items.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-[8000px] w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400">
                        <th className="py-3">Item</th>
                        <th>Quantity</th>
                        <th>Minimum Level</th>
                      </tr>
                    </thead>

                    <tbody>
                      {lowStock.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-gray-800"
                        >
                          <td className="py-3">{item.itemName}</td>
                          <td>
                            {item.quantity} {item.unit}
                          </td>
                          <td>{item.minimumStockLevel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default Reports;