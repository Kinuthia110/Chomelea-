import Customer from "../../models/Customer.js";
import Project from "../../models/Project.js";
import Quotation from "../../models/Quotation.js";
import Invoice from "../../models/Invoice.js";
import Payment from "../../models/Payment.js";
import Inventory from "../../models/Inventory.js";
import auth from "../../middleware/auth.js";

const analyticsResolver = {
  Query: {
    revenueSummary: async (_, args, { req }) => {
      await auth(req);

      const totals = await Invoice.aggregate([
        {
          $group: {
            _id: null,
            totalInvoiceValue: { $sum: "$grandTotal" },
            totalRevenueReceived: { $sum: "$amountPaid" },
            outstandingBalance: { $sum: "$balance" }
          }
        }
      ]);

      const paidInvoices = await Invoice.countDocuments({
        paymentStatus: "PAID"
      });

      const partialInvoices = await Invoice.countDocuments({
        paymentStatus: "PARTIAL"
      });

      const unpaidInvoices = await Invoice.countDocuments({
        paymentStatus: "UNPAID"
      });

      return {
        totalInvoiceValue: totals[0]?.totalInvoiceValue || 0,
        totalRevenueReceived: totals[0]?.totalRevenueReceived || 0,
        outstandingBalance: totals[0]?.outstandingBalance || 0,
        paidInvoices,
        partialInvoices,
        unpaidInvoices
      };
    },

    dashboardStats: async (_, args, { req }) => {
      await auth(req);

      const totalCustomers = await Customer.countDocuments();
      const totalProjects = await Project.countDocuments();

      const activeProjects = await Project.countDocuments({
        status: { $ne: "COMPLETED" }
      });

      const completedProjects = await Project.countDocuments({
        status: "COMPLETED"
      });

      const totalQuotations = await Quotation.countDocuments();

      const approvedQuotations = await Quotation.countDocuments({
        status: "APPROVED"
      });

      const totalInvoices = await Invoice.countDocuments();
      const totalPayments = await Payment.countDocuments();

      const lowStockCount = await Inventory.countDocuments({
        $expr: {
          $lte: ["$quantity", "$minimumStockLevel"]
        }
      });

      return {
        totalCustomers,
        totalProjects,
        activeProjects,
        completedProjects,
        totalQuotations,
        approvedQuotations,
        totalInvoices,
        totalPayments,
        lowStockCount
      };
    },

    monthlyRevenue: async (_, args, { req }) => {
      await auth(req);

      const result = await Invoice.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            invoiceValue: { $sum: "$grandTotal" },
            revenueReceived: { $sum: "$amountPaid" },
            outstandingBalance: { $sum: "$balance" }
          }
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1
          }
        }
      ]);

      return result.map((item) => ({
        month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
        invoiceValue: item.invoiceValue || 0,
        revenueReceived: item.revenueReceived || 0,
        outstandingBalance: item.outstandingBalance || 0
      }));
    },

    projectStatusCounts: async (_, args, { req }) => {
      await auth(req);

      const result = await Project.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        },
        {
          $sort: {
            count: -1
          }
        }
      ]);

      return result.map((item) => ({
        status: item._id || "UNKNOWN",
        count: item.count
      }));
    },

    recentActivities: async (_, args, { req }) => {
      await auth(req);

      const recentProjects = await Project.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("customer");

      const recentPayments = await Payment.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("customer");

      const recentInvoices = await Invoice.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("customer");

      const activities = [
        ...recentProjects.map((project) => ({
          type: "PROJECT",
          title: project.projectTitle,
          description: `Project for ${project.customer?.fullName || "customer"}`,
          createdAt: project.createdAt
        })),

        ...recentPayments.map((payment) => ({
          type: "PAYMENT",
          title: `Payment ${payment.paymentNumber || ""}`,
          description: `KES ${payment.amount} received from ${
            payment.customer?.fullName || "customer"
          }`,
          createdAt: payment.createdAt
        })),

        ...recentInvoices.map((invoice) => ({
          type: "INVOICE",
          title: invoice.invoiceNumber,
          description: `Invoice for ${invoice.customer?.fullName || "customer"}`,
          createdAt: invoice.createdAt
        }))
      ];

      return activities
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);
    }
  }
};

export default analyticsResolver;