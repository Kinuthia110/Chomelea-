import { useState } from "react";
import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import Sidebar from "../components/sidebar.jsx";

const GET_CUSTOMERS = gql`
  query {
    customers {
      id
      fullName
      phone
      email
      location
      notes
    }
  }
`;

const CREATE_CUSTOMER = gql`
  mutation CreateCustomer(
    $fullName: String!
    $phone: String!
    $email: String
    $location: String
    $notes: String
  ) {
    createCustomer(
      fullName: $fullName
      phone: $phone
      email: $email
      location: $location
      notes: $notes
    ) {
      id
    }
  }
`;

const DELETE_CUSTOMER = gql`
  mutation DeleteCustomer($id: ID!) {
    deleteCustomer(id: $id)
  }
`;

function Customers() {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    location: "",
    notes: ""
  });

  const { loading, error, data, refetch } = useQuery(GET_CUSTOMERS, {
    fetchPolicy: "network-only"
  });

  const [createCustomer, { loading: creating }] = useMutation(CREATE_CUSTOMER);
  const [deleteCustomer, { loading: deleting }] = useMutation(DELETE_CUSTOMER);

  const customers = Array.isArray(data?.customers) ? data.customers : [];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createCustomer({ variables: form });
    setForm({ fullName: "", phone: "", email: "", location: "", notes: "" });
    await refetch();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this customer?")) return;
    await deleteCustomer({ variables: { id } });
    await refetch();
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-white flex">
      <Sidebar />

      <main className="flex-1 p-4 md:p-6 pt-20 md:pt-6 overflow-x-hidden">
        <h1 className="text-4xl font-bold text-orange-500">Customers</h1>
        <p className="text-gray-400 mt-2">Manage CHOMELEA customer records.</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-300 p-4 rounded-xl mt-6">
            {error.message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-[#161B22] border border-gray-800 rounded-2xl p-6 mt-8 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Full Name" className="p-3 rounded-lg bg-[#0D1117] border border-gray-700" required />
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="p-3 rounded-lg bg-[#0D1117] border border-gray-700" required />
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="p-3 rounded-lg bg-[#0D1117] border border-gray-700" />
          <input name="location" value={form.location} onChange={handleChange} placeholder="Location" className="p-3 rounded-lg bg-[#0D1117] border border-gray-700" />
          <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Notes" className="md:col-span-2 p-3 rounded-lg bg-[#0D1117] border border-gray-700" />

          <button disabled={creating} className="md:col-span-2 bg-orange-500 hover:bg-orange-600 p-3 rounded-lg font-bold">
            {creating ? "Saving..." : "Add Customer"}
          </button>
        </form>

        <section className="bg-[#161B22] border border-gray-800 rounded-2xl p-6 mt-8">
          <h2 className="text-2xl font-bold mb-4">Customer List</h2>

          {loading && <p>Loading customers...</p>}
          {!loading && customers.length === 0 && <p className="text-gray-400">No customers found yet.</p>}

          {!loading && customers.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full text-left">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-800">
                    <th className="py-3">Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Location</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id} className="border-b border-gray-800">
                      <td className="py-3">{customer.fullName || "-"}</td>
                      <td>{customer.phone || "-"}</td>
                      <td>{customer.email || "-"}</td>
                      <td>{customer.location || "-"}</td>
                      <td>{customer.notes || "-"}</td>
                      <td>
                        <button
                          disabled={deleting}
                          onClick={() => handleDelete(customer.id)}
                          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
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

export default Customers;