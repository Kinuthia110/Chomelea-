import { useState } from "react";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import Sidebar from "../components/sidebar.jsx";

const GET_INVENTORY = gql`
  query {
    inventoryItems {
      id
      itemName
      category
      quantity
      unit
      buyingPrice
      sellingPrice
      minimumStockLevel
      supplier
    }
  }
`;

const CREATE_ITEM = gql`
  mutation CreateInventoryItem(
    $itemName: String!
    $category: String
    $quantity: Float
    $unit: String
    $buyingPrice: Float
    $sellingPrice: Float
    $minimumStockLevel: Float
    $supplier: String
  ) {
    createInventoryItem(
      itemName: $itemName
      category: $category
      quantity: $quantity
      unit: $unit
      buyingPrice: $buyingPrice
      sellingPrice: $sellingPrice
      minimumStockLevel: $minimumStockLevel
      supplier: $supplier
    ) {
      id
    }
  }
`;

const STOCK_IN = gql`
  mutation StockIn($inventoryItem: ID!, $quantity: Float!) {
    stockIn(inventoryItem: $inventoryItem, quantity: $quantity) {
      id
      quantity
    }
  }
`;

const STOCK_OUT = gql`
  mutation StockOut($inventoryItem: ID!, $quantity: Float!) {
    stockOut(inventoryItem: $inventoryItem, quantity: $quantity) {
      id
      quantity
    }
  }
`;

const DELETE_INVENTORY_ITEM = gql`
  mutation DeleteInventoryItem($id: ID!) {
    deleteInventoryItem(id: $id)
  }
`;

function Inventory() {
  const [form, setForm] = useState({
    itemName: "",
    category: "OTHER",
    quantity: "",
    unit: "pcs",
    buyingPrice: "",
    sellingPrice: "",
    minimumStockLevel: "",
    supplier: ""
  });

  const { loading, error, data, refetch } = useQuery(GET_INVENTORY, {
    fetchPolicy: "network-only"
  });

  const [createInventoryItem, { loading: creating }] = useMutation(CREATE_ITEM);
  const [stockIn] = useMutation(STOCK_IN);
  const [stockOut] = useMutation(STOCK_OUT);
  const [deleteInventoryItem, { loading: deleting }] =
    useMutation(DELETE_INVENTORY_ITEM);

  const items = Array.isArray(data?.inventoryItems) ? data.inventoryItems : [];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toNumber = (value) => {
    const number = parseFloat(value);
    return Number.isNaN(number) ? 0 : number;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await createInventoryItem({
      variables: {
        ...form,
        quantity: toNumber(form.quantity),
        buyingPrice: toNumber(form.buyingPrice),
        sellingPrice: toNumber(form.sellingPrice),
        minimumStockLevel: toNumber(form.minimumStockLevel)
      }
    });

    setForm({
      itemName: "",
      category: "OTHER",
      quantity: "",
      unit: "pcs",
      buyingPrice: "",
      sellingPrice: "",
      minimumStockLevel: "",
      supplier: ""
    });

    await refetch();
  };

  const handleStockIn = async (id) => {
    const qty = prompt("Stock In Quantity");
    if (!qty) return;

    await stockIn({
      variables: {
        inventoryItem: id,
        quantity: toNumber(qty)
      }
    });

    await refetch();
  };

  const handleStockOut = async (id) => {
    const qty = prompt("Stock Out Quantity");
    if (!qty) return;

    await stockOut({
      variables: {
        inventoryItem: id,
        quantity: toNumber(qty)
      }
    });

    await refetch();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this inventory item?")) return;

    await deleteInventoryItem({
      variables: { id }
    });

    await refetch();
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-white flex">
      <Sidebar />

      <main className="flex-1 p-4 md:p-6 pt-20 md:pt-6 overflow-x-hidden">
        <h1 className="text-4xl font-bold text-orange-500">Inventory</h1>

        <p className="text-gray-400 mt-2">
          Material stock management.
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
          <input
            name="itemName"
            value={form.itemName}
            onChange={handleChange}
            placeholder="Item Name"
            className="p-3 rounded-lg bg-[#0D1117] border border-gray-700"
            required
          />

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="p-3 rounded-lg bg-[#0D1117] border border-gray-700"
          >
            <option value="PIPE">Pipe</option>
            <option value="PAINT">Paint</option>
            <option value="ROD">Rod</option>
            <option value="HINGE">Hinge</option>
            <option value="SHEET">Sheet</option>
            <option value="TOOLS">Tools</option>
            <option value="OTHER">Other</option>
          </select>

          <input
            name="quantity"
            type="number"
            value={form.quantity}
            onChange={handleChange}
            placeholder="Quantity"
            className="p-3 rounded-lg bg-[#0D1117] border border-gray-700"
          />

          <input
            name="unit"
            value={form.unit}
            onChange={handleChange}
            placeholder="Unit"
            className="p-3 rounded-lg bg-[#0D1117] border border-gray-700"
          />

          <input
            name="buyingPrice"
            type="number"
            value={form.buyingPrice}
            onChange={handleChange}
            placeholder="Buying Price"
            className="p-3 rounded-lg bg-[#0D1117] border border-gray-700"
          />

          <input
            name="sellingPrice"
            type="number"
            value={form.sellingPrice}
            onChange={handleChange}
            placeholder="Selling Price"
            className="p-3 rounded-lg bg-[#0D1117] border border-gray-700"
          />

          <input
            name="minimumStockLevel"
            type="number"
            value={form.minimumStockLevel}
            onChange={handleChange}
            placeholder="Minimum Stock Level"
            className="p-3 rounded-lg bg-[#0D1117] border border-gray-700"
          />

          <input
            name="supplier"
            value={form.supplier}
            onChange={handleChange}
            placeholder="Supplier"
            className="p-3 rounded-lg bg-[#0D1117] border border-gray-700"
          />

          <button
            disabled={creating}
            className="md:col-span-2 bg-orange-500 hover:bg-orange-600 p-3 rounded-lg font-bold"
          >
            {creating ? "Saving..." : "Add Inventory Item"}
          </button>
        </form>

        <section className="bg-[#161B22] border border-gray-800 rounded-2xl p-6 mt-8">
          <h2 className="text-2xl font-bold mb-4">Inventory List</h2>

          {loading && <p>Loading inventory...</p>}

          {!loading && items.length === 0 && (
            <p className="text-gray-400">No inventory items found yet.</p>
          )}

          {!loading && items.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-[950px] w-full text-left">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400">
                    <th className="py-3">Item</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th>Buy Price</th>
                    <th>Sell Price</th>
                    <th>Supplier</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-800">
                      <td className="py-3">
                        <p className="font-semibold">{item.itemName}</p>

                        {item.quantity <= item.minimumStockLevel && (
                          <span className="text-red-400 text-sm">
                            Low Stock
                          </span>
                        )}
                      </td>

                      <td>{item.category}</td>
                      <td>
                        {item.quantity} {item.unit}
                      </td>
                      <td>KES {item.buyingPrice || 0}</td>
                      <td>KES {item.sellingPrice || 0}</td>
                      <td>{item.supplier || "-"}</td>

                      <td>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleStockIn(item.id)}
                            className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded"
                          >
                            + Stock
                          </button>

                          <button
                            onClick={() => handleStockOut(item.id)}
                            className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded"
                          >
                            - Stock
                          </button>

                          <button
                            disabled={deleting}
                            onClick={() => handleDelete(item.id)}
                            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
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

export default Inventory;