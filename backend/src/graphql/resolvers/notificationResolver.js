import Invoice from "../../models/Invoice.js";
import Inventory from "../../models/Inventory.js";
import Project from "../../models/Project.js";
import auth from "../../middleware/auth.js";

const notificationResolver = {
  Query: {
    notifications: async (_, args, { req }) => {
      await auth(req);

      const lowStockItems = await Inventory.find({
        $expr: {
          $lte: ["$quantity", "$minimumStockLevel"]
        }
      }).limit(5);

      const unpaidInvoices = await Invoice.find({
        paymentStatus: { $in: ["UNPAID", "PARTIAL"] }
      })
        .populate("customer")
        .sort({ createdAt: -1 })
        .limit(5);

      const activeProjects = await Project.find({
        status: { $ne: "COMPLETED" }
      })
        .populate("customer")
        .sort({ createdAt: -1 })
        .limit(5);

      const notifications = [
        ...lowStockItems.map((item) => ({
          type: "LOW_STOCK",
          title: "Low Stock Alert",
          message: `${item.itemName} is low. Remaining: ${item.quantity} ${item.unit}`,
          severity: "HIGH",
          createdAt: item.updatedAt
        })),

        ...unpaidInvoices.map((invoice) => ({
          type: "UNPAID_INVOICE",
          title: "Invoice Payment Pending",
          message: `${invoice.invoiceNumber} has balance KES ${invoice.balance} from ${
            invoice.customer?.fullName || "customer"
          }`,
          severity: "MEDIUM",
          createdAt: invoice.updatedAt
        })),

        ...activeProjects.map((project) => ({
          type: "ACTIVE_PROJECT",
          title: "Active Project",
          message: `${project.projectTitle} is currently at ${project.status}`,
          severity: "LOW",
          createdAt: project.updatedAt
        }))
      ];

      return notifications
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 15);
    }
  }
};

export default notificationResolver;