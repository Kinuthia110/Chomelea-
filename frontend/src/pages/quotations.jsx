import { useState } from "react";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import Sidebar from "../components/sidebar.jsx";

const GET_QUOTATIONS = gql`
  query {
    quotations {
      id
      quotationNumber
      subtotal
      tax
      grandTotal
      status
      notes
      customer {
        fullName
        phone
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

const CREATE_QUOTATION = gql`
  mutation CreateQuotation(
    $customer: ID!
    $items: [QuotationItemInput!]!
    $laborCost: Float
    $transportCost: Float
    $tax: Float
    $notes: String
  ) {
    createQuotation(
      customer: $customer
      items: $items
      laborCost: $laborCost
      transportCost: $transportCost
      tax: $tax
      notes: $notes
    ) {
      id
    }
  }
`;

const GENERATE_QUOTATION_PDF = gql`
  mutation GenerateQuotationPDF($id: ID!) {
    generateQuotationPDF(id: $id)
  }
`;

const DELETE_QUOTATION = gql`
  mutation DeleteQuotation($id: ID!) {
    deleteQuotation(id: $id)
  }
`;

function Quotations() {
  const [form, setForm] = useState({
    customer: "",
    itemName: "",
    quantity: "",
    unitPrice: "",
    laborCost: "",
    transportCost: "",
    tax: "",
    notes: ""
  });

  const { loading, error, data, refetch } = useQuery(GET_QUOTATIONS, {
    fetchPolicy: "network-only"
  });

  const { data: customerData } = useQuery(GET_CUSTOMERS, {
    fetchPolicy: "network-only"
  });

  const [createQuotation, { loading: creating }] =
    useMutation(CREATE_QUOTATION);

  const [generateQuotationPDF, { loading: generating }] =
    useMutation(GENERATE_QUOTATION_PDF);

  const [deleteQuotation, { loading: deleting }] =
    useMutation(DELETE_QUOTATION);

  const quotations = Array.isArray(data?.quotations) ? data.quotations : [];
  const customers = Array.isArray(customerData?.customers)
    ? customerData.customers
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    await createQuotation({
      variables: {
        customer: form.customer,
        items: [
          {
            itemName: form.itemName,
            quantity: toNumber(form.quantity),
            unitPrice: toNumber(form.unitPrice)
          }
        ],
        laborCost: toNumber(form.laborCost),
        transportCost: toNumber(form.transportCost),
        tax: toNumber(form.tax),
        notes: form.notes
      }
    });

    setForm({
      customer: "",
      itemName: "",
      quantity: "",
      unitPrice: "",
      laborCost: "",
      transportCost: "",
      tax: "",
      notes: ""
    });

    await refetch();
  };

  const handlePDF = async (id) => {
    const result = await generateQuotationPDF({
      variables: { id }
    });

    const pdfUrl = result.data.generateQuotationPDF;

    window.open(`http://localhost:5000${pdfUrl}`, "_blank");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this quotation?")) return;

    await deleteQuotation({
      variables: { id }
    });

    await refetch();
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-white flex">
      <Sidebar />

      <main className="flex-1 p-4 md:p-6 pt-20 md:pt-6 overflow-x-hidden">
        <h1 className="text-4xl font-bold text-orange-500">Quotations</h1>

        <p className="text-gray-400 mt-2">
          Create and manage customer quotations.
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
            name="itemName"
            value={form.itemName}
            onChange={handleChange}
            placeholder="Item name e.g. Steel Pipes"
            className="p-3 rounded-lg bg-[#0D1117] border border-gray-700"
            required
          />

          <input
            name="quantity"
            type="number"
            value={form.quantity}
            onChange={handleChange}
            placeholder="Quantity"
            className="p-3 rounded-lg bg-[#0D1117] border border-gray-700"
            required
          />

          <input
            name="unitPrice"
            type="number"
            value={form.unitPrice}
            onChange={handleChange}
            placeholder="Unit Price"
            className="p-3 rounded-lg bg-[#0D1117] border border-gray-700"
            required
          />

          <input
            name="laborCost"
            type="number"
            value={form.laborCost}
            onChange={handleChange}
            placeholder="Labor Cost"
            className="p-3 rounded-lg bg-[#0D1117] border border-gray-700"
          />

          <input
            name="transportCost"
            type="number"
            value={form.transportCost}
            onChange={handleChange}
            placeholder="Transport Cost"
            className="p-3 rounded-lg bg-[#0D1117] border border-gray-700"
          />

          <input
            name="tax"
            type="number"
            value={form.tax}
            onChange={handleChange}
            placeholder="Tax"
            className="p-3 rounded-lg bg-[#0D1117] border border-gray-700"
          />

          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Quotation notes"
            className="md:col-span-2 p-3 rounded-lg bg-[#0D1117] border border-gray-700"
          />

          <button
            disabled={creating}
            className="md:col-span-2 bg-orange-500 hover:bg-orange-600 rounded-lg p-3 font-bold disabled:opacity-60"
          >
            {creating ? "Creating..." : "Create Quotation"}
          </button>
        </form>

        <section className="bg-[#161B22] border border-gray-800 rounded-2xl p-6 mt-8">
          <h2 className="text-2xl font-bold mb-4">Quotation List</h2>

          {loading && <p>Loading quotations...</p>}

          {!loading && quotations.length === 0 && (
            <p className="text-gray-400">No quotations found yet.</p>
          )}

          {!loading && quotations.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-[950px] w-full text-left">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400">
                    <th className="py-3">Quotation No</th>
                    <th>Customer</th>
                    <th>Subtotal</th>
                    <th>Tax</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {quotations.map((quotation) => (
                    <tr key={quotation.id} className="border-b border-gray-800">
                      <td className="py-3">{quotation.quotationNumber || "-"}</td>

                      <td>
                        {quotation.customer?.fullName || "-"}
                        <p className="text-gray-500 text-sm">
                          {quotation.customer?.phone || ""}
                        </p>
                      </td>

                      <td>KES {quotation.subtotal || 0}</td>
                      <td>KES {quotation.tax || 0}</td>
                      <td>KES {quotation.grandTotal || 0}</td>

                      <td>
                        <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-sm">
                          {quotation.status || "PENDING"}
                        </span>
                      </td>

                      <td>
                        <div className="flex flex-wrap gap-2">
                          <button
                            disabled={generating}
                            onClick={() => handlePDF(quotation.id)}
                            className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg disabled:opacity-60"
                          >
                            PDF
                          </button>

                          <button
                            disabled={deleting}
                            onClick={() => handleDelete(quotation.id)}
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

export default Quotations;