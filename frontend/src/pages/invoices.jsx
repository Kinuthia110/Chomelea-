import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import Sidebar from "../components/sidebar.jsx";

const GET_INVOICES = gql`
  query {
    invoices {
      id
      invoiceNumber
      grandTotal
      amountPaid
      balance
      paymentStatus
      invoiceStatus
      customer {
        fullName
        phone
      }
    }
  }
`;

const GENERATE_INVOICE_PDF = gql`
  mutation GenerateInvoicePDF($id: ID!) {
    generateInvoicePDF(id: $id)
  }
`;

const DELETE_INVOICE = gql`
  mutation DeleteInvoice($id: ID!) {
    deleteInvoice(id: $id)
  }
`;

function Invoices() {
  const { loading, error, data, refetch } = useQuery(GET_INVOICES, {
    fetchPolicy: "network-only"
  });

  const [generateInvoicePDF, { loading: generating }] =
    useMutation(GENERATE_INVOICE_PDF);

  const [deleteInvoice, { loading: deleting }] = useMutation(DELETE_INVOICE);

  const invoices = Array.isArray(data?.invoices) ? data.invoices : [];

  const handlePDF = async (id) => {
    const result = await generateInvoicePDF({
      variables: { id }
    });

    const pdfUrl = result.data.generateInvoicePDF;

    window.open(`http://localhost:5000${pdfUrl}`, "_blank");

    await refetch();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this invoice?")) return;

    await deleteInvoice({
      variables: { id }
    });

    await refetch();
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-white flex">
      <Sidebar />

      <main className="flex-1 p-4 md:p-6 pt-20 md:pt-6 overflow-x-hidden">
        <h1 className="text-4xl font-bold text-orange-500">Invoices</h1>

        <p className="text-gray-400 mt-2">
          Manage customer invoices and PDF downloads.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-300 p-4 rounded-xl mt-6">
            {error.message}
          </div>
        )}

        <section className="bg-[#161B22] border border-gray-800 rounded-2xl p-6 mt-8">
          <h2 className="text-2xl font-bold mb-4">Invoice List</h2>

          {loading && <p>Loading invoices...</p>}

          {!loading && invoices.length === 0 && (
            <p className="text-gray-400">No invoices found yet.</p>
          )}

          {!loading && invoices.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-[950px] w-full text-left">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400">
                    <th className="py-3">Invoice No</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Paid</th>
                    <th>Balance</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-gray-800">
                      <td className="py-3">{invoice.invoiceNumber || "-"}</td>

                      <td>
                        {invoice.customer?.fullName || "-"}
                        <p className="text-gray-500 text-sm">
                          {invoice.customer?.phone || ""}
                        </p>
                      </td>

                      <td>KES {invoice.grandTotal || 0}</td>
                      <td>KES {invoice.amountPaid || 0}</td>
                      <td>KES {invoice.balance || 0}</td>

                      <td>
                        <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-sm">
                          {invoice.paymentStatus || "UNPAID"}
                        </span>
                      </td>

                      <td>{invoice.invoiceStatus || "DRAFT"}</td>

                      <td>
                        <div className="flex flex-wrap gap-2">
                          <button
                            disabled={generating}
                            onClick={() => handlePDF(invoice.id)}
                            className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg disabled:opacity-60"
                          >
                            PDF
                          </button>

                          <button
                            disabled={deleting}
                            onClick={() => handleDelete(invoice.id)}
                            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg disabled:opacity-60"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Invoices;