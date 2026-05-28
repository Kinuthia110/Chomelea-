import { useState } from "react";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import Sidebar from "../components/sidebar.jsx";

const GET_PAYMENTS = gql`
  query {
    payments {
      id
      paymentNumber
      amount
      paymentMethod
      transactionCode
      notes
      customer {
        fullName
        phone
      }
      invoice {
        invoiceNumber
        balance
        paymentStatus
      }
      project {
        projectTitle
      }
    }
  }
`;

const GET_CUSTOMERS = gql`
  query {
    customers {
      id
      fullName
    }
  }
`;

const GET_INVOICES = gql`
  query {
    invoices {
      id
      invoiceNumber
      balance
      customer {
        id
        fullName
      }
    }
  }
`;

const RECORD_PAYMENT = gql`
  mutation RecordPayment(
    $customer: ID!
    $invoice: ID
    $amount: Float!
    $paymentMethod: String
    $transactionCode: String
    $notes: String
  ) {
    recordPayment(
      customer: $customer
      invoice: $invoice
      amount: $amount
      paymentMethod: $paymentMethod
      transactionCode: $transactionCode
      notes: $notes
    ) {
      id
    }
  }
`;

const DELETE_PAYMENT = gql`
  mutation DeletePayment($id: ID!) {
    deletePayment(id: $id)
  }
`;

function Payments() {
  const [form, setForm] = useState({
    customer: "",
    invoice: "",
    amount: "",
    paymentMethod: "CASH",
    transactionCode: "",
    notes: ""
  });

  const { loading, error, data, refetch } = useQuery(GET_PAYMENTS, {
    fetchPolicy: "network-only"
  });

  const { data: customerData } = useQuery(GET_CUSTOMERS, {
    fetchPolicy: "network-only"
  });

  const { data: invoiceData, refetch: refetchInvoices } = useQuery(GET_INVOICES, {
    fetchPolicy: "network-only"
  });

  const [recordPayment, { loading: saving }] = useMutation(RECORD_PAYMENT);
  const [deletePayment, { loading: deleting }] = useMutation(DELETE_PAYMENT);

  const payments = Array.isArray(data?.payments) ? data.payments : [];
  const customers = Array.isArray(customerData?.customers)
    ? customerData.customers
    : [];
  const invoices = Array.isArray(invoiceData?.invoices)
    ? invoiceData.invoices
    : [];

  const toNumber = (value) => {
    const number = parseFloat(value);
    return Number.isNaN(number) ? 0 : number;
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleInvoiceChange = (e) => {
    const invoiceId = e.target.value;
    const selectedInvoice = invoices.find((invoice) => invoice.id === invoiceId);

    setForm({
      ...form,
      invoice: invoiceId,
      customer: selectedInvoice?.customer?.id || form.customer
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await recordPayment({
      variables: {
        customer: form.customer,
        invoice: form.invoice || null,
        amount: toNumber(form.amount),
        paymentMethod: form.paymentMethod,
        transactionCode: form.transactionCode,
        notes: form.notes
      }
    });

    setForm({
      customer: "",
      invoice: "",
      amount: "",
      paymentMethod: "CASH",
      transactionCode: "",
      notes: ""
    });

    await refetch();
    await refetchInvoices();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this payment?")) return;

    await deletePayment({
      variables: { id }
    });

    await refetch();
    await refetchInvoices();
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-white flex">
      <Sidebar />

      <main className="flex-1 p-4 md:p-6 pt-20 md:pt-6 overflow-x-hidden">
        <h1 className="text-4xl font-bold text-orange-500">Payments</h1>

        <p className="text-gray-400 mt-2">
          Record and track customer payments.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-300 p-4 rounded-xl mt-6">
            {error.message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-[#161B22] border border-gray-800 rounded-2xl p-6 mt-8 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <select
            name="invoice"
            value={form.invoice}
            onChange={handleInvoiceChange}
            className="p-3 rounded-lg bg-[#0D1117] border border-gray-700"
          >
            <option value="">Select Invoice Optional</option>

            {invoices.map((invoice) => (
              <option key={invoice.id} value={invoice.id}>
                {invoice.invoiceNumber} — {invoice.customer?.fullName || "No customer"} — Balance KES{" "}
                {invoice.balance || 0}
              </option>
            ))}
          </select>

          <select
            name="customer"
            value={form.customer}
            onChange={handleChange}
            className="p-3 rounded-lg bg-[#0D1117] border border-gray-700"
            required
          >
            <option value="">Select Customer</option>

            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.fullName}
              </option>
            ))}
          </select>

          <input
            name="amount"
            type="number"
            value={form.amount}
            onChange={handleChange}
            placeholder="Amount Paid"
            className="p-3 rounded-lg bg-[#0D1117] border border-gray-700"
            required
          />

          <select
            name="paymentMethod"
            value={form.paymentMethod}
            onChange={handleChange}
            className="p-3 rounded-lg bg-[#0D1117] border border-gray-700"
          >
            <option value="CASH">Cash</option>
            <option value="MPESA">M-Pesa</option>
            <option value="BANK">Bank</option>
          </select>

          <input
            name="transactionCode"
            value={form.transactionCode}
            onChange={handleChange}
            placeholder="Transaction Code"
            className="p-3 rounded-lg bg-[#0D1117] border border-gray-700"
          />

          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Payment notes"
            className="md:col-span-2 p-3 rounded-lg bg-[#0D1117] border border-gray-700"
          />

          <button
            disabled={saving}
            className="md:col-span-2 bg-orange-500 hover:bg-orange-600 rounded-lg p-3 font-bold disabled:opacity-60"
          >
            {saving ? "Saving Payment..." : "Record Payment"}
          </button>
        </form>

        <section className="bg-[#161B22] border border-gray-800 rounded-2xl p-6 mt-8">
          <h2 className="text-2xl font-bold mb-4">Payment Records</h2>

          {loading && <p>Loading payments...</p>}

          {!loading && payments.length === 0 && (
            <p className="text-gray-400">No payments found yet.</p>
          )}

          {!loading && payments.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-[950px] w-full text-left">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400">
                    <th className="py-3">Payment No</th>
                    <th>Customer</th>
                    <th>Invoice</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Transaction</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-gray-800">
                      <td className="py-3">{payment.paymentNumber || "-"}</td>

                      <td>
                        {payment.customer?.fullName || "-"}
                        <p className="text-gray-500 text-sm">
                          {payment.customer?.phone || ""}
                        </p>
                      </td>

                      <td>
                        {payment.invoice?.invoiceNumber || "-"}
                        {payment.invoice && (
                          <p className="text-gray-500 text-sm">
                            {payment.invoice.paymentStatus} · Balance KES{" "}
                            {payment.invoice.balance || 0}
                          </p>
                        )}
                      </td>

                      <td>KES {payment.amount || 0}</td>

                      <td>
                        <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-sm">
                          {payment.paymentMethod || "CASH"}
                        </span>
                      </td>

                      <td>{payment.transactionCode || "-"}</td>

                      <td>
                        <button
                          disabled={deleting}
                          onClick={() => handleDelete(payment.id)}
                          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded disabled:opacity-60"
                        >
                          Delete
                        </button>
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

export default Payments;