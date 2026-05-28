import { useState } from "react";
import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import Sidebar from "../components/sidebar.jsx";

const GET_PROJECTS = gql`
  query {
    projects {
      id
      projectTitle
      description
      category
      status
      totalCost
      balance
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

const CREATE_PROJECT = gql`
  mutation CreateProject(
    $customer: ID!
    $projectTitle: String!
    $description: String
    $category: String
    $totalCost: Float
  ) {
    createProject(
      customer: $customer
      projectTitle: $projectTitle
      description: $description
      category: $category
      totalCost: $totalCost
    ) {
      id
    }
  }
`;

const DELETE_PROJECT = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id)
  }
`;

function Projects() {
  const [form, setForm] = useState({
    customer: "",
    projectTitle: "",
    description: "",
    category: "CUSTOM",
    totalCost: ""
  });

  const { loading, error, data, refetch } = useQuery(GET_PROJECTS, {
    fetchPolicy: "network-only"
  });

  const { data: customerData } = useQuery(GET_CUSTOMERS, {
    fetchPolicy: "network-only"
  });

  const [createProject, { loading: creating }] = useMutation(CREATE_PROJECT);
  const [deleteProject, { loading: deleting }] = useMutation(DELETE_PROJECT);

  const projects = Array.isArray(data?.projects) ? data.projects : [];
  const customers = Array.isArray(customerData?.customers) ? customerData.customers : [];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await createProject({
      variables: {
        ...form,
        totalCost: parseFloat(form.totalCost || 0)
      }
    });

    setForm({
      customer: "",
      projectTitle: "",
      description: "",
      category: "CUSTOM",
      totalCost: ""
    });

    await refetch();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    await deleteProject({ variables: { id } });
    await refetch();
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-white flex">
      <Sidebar />

      <main className="flex-1 p-4 md:p-6 pt-20 md:pt-6 overflow-x-hidden">
        <h1 className="text-4xl font-bold text-orange-500">Projects</h1>
        <p className="text-gray-400 mt-2">Manage fabrication projects.</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-300 p-4 rounded-xl mt-6">
            {error.message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-[#161B22] border border-gray-800 rounded-2xl p-6 mt-8 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <select name="customer" value={form.customer} onChange={handleChange} className="p-3 rounded-lg bg-[#0D1117] border border-gray-700" required>
            <option value="">Select Customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>{customer.fullName}</option>
            ))}
          </select>

          <input name="projectTitle" value={form.projectTitle} onChange={handleChange} placeholder="Project Title" className="p-3 rounded-lg bg-[#0D1117] border border-gray-700" required />

          <select name="category" value={form.category} onChange={handleChange} className="p-3 rounded-lg bg-[#0D1117] border border-gray-700">
            <option value="GATE">Gate</option>
            <option value="WINDOW">Window</option>
            <option value="DOOR">Door</option>
            <option value="STAIRCASE">Staircase</option>
            <option value="BALCONY">Balcony</option>
            <option value="CUSTOM">Custom</option>
          </select>

          <input name="totalCost" type="number" value={form.totalCost} onChange={handleChange} placeholder="Total Cost" className="p-3 rounded-lg bg-[#0D1117] border border-gray-700" />

          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Project Description" className="md:col-span-2 p-3 rounded-lg bg-[#0D1117] border border-gray-700" />

          <button disabled={creating} className="md:col-span-2 bg-orange-500 hover:bg-orange-600 p-3 rounded-lg font-bold">
            {creating ? "Creating..." : "Create Project"}
          </button>
        </form>

        <section className="bg-[#161B22] border border-gray-800 rounded-2xl p-6 mt-8">
          <h2 className="text-2xl font-bold mb-4">Project List</h2>

          {loading && <p>Loading projects...</p>}
          {!loading && projects.length === 0 && <p className="text-gray-400">No projects found yet.</p>}

          {!loading && projects.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-[950px] w-full text-left">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400">
                    <th className="py-3">Project</th>
                    <th>Customer</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Cost</th>
                    <th>Balance</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id} className="border-b border-gray-800">
                      <td className="py-3">
                        <p className="font-semibold">{project.projectTitle}</p>
                        <p className="text-sm text-gray-400">{project.description || "-"}</p>
                      </td>
                      <td>{project.customer?.fullName || "-"}</td>
                      <td>{project.category}</td>
                      <td>
                        <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm">
                          {project.status}
                        </span>
                      </td>
                      <td>KES {project.totalCost || 0}</td>
                      <td>KES {project.balance || 0}</td>
                      <td>
                        <button
                          disabled={deleting}
                          onClick={() => handleDelete(project.id)}
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

export default Projects;