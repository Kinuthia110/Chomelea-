import Customer from "../../models/customer.js";
import Project from "../../models/project.js";
import Quotation from "../../models/quotation.js";
import Invoice from "../../models/invoice.js";
import Payment from "../../models/payment.js";
import Inventory from "../../models/inventory.js";
import auth from "../../middleware/auth.js";

const percentGrowth = (current, previous) => {
  if (!previous || previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return Number((((current - previous) / previous) * 100).toFixed(2));
};

const getMonthRange = (monthsBack = 0) => {
  const now = new Date();

  const start = new Date(
    now.getFullYear(),
    now.getMonth() - monthsBack,
    1
  );

  const end = new Date(
    now.getFullYear(),
    now.getMonth() - monthsBack + 1,
    1
  );

  return { start, end };
};

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

    topCustomers: async (_, args, { req }) => {
      await auth(req);

      const result = await Invoice.aggregate([
        {
          $group: {
            _id: "$customer",
            totalSpent: { $sum: "$amountPaid" },
            invoiceCount: { $sum: 1 }
          }
        },
        {
          $sort: {
            totalSpent: -1
          }
        },
        {
          $limit: 5
        },
        {
          $lookup: {
            from: "customers",
            localField: "_id",
            foreignField: "_id",
            as: "customer"
          }
        },
        {
          $unwind: {
            path: "$customer",
            preserveNullAndEmptyArrays: true
          }
        }
      ]);

      return result.map((item) => ({
        customerName: item.customer?.fullName || "Unknown Customer",
        totalSpent: item.totalSpent || 0,
        invoiceCount: item.invoiceCount || 0
      }));
    },

    dashboardLowStockItems: async (_, args, { req }) => {
      await auth(req);

      const items = await Inventory.find({
        $expr: {
          $lte: ["$quantity", "$minimumStockLevel"]
        }
      })
        .sort({ quantity: 1 })
        .limit(8);

      return items.map((item) => ({
        itemName: item.itemName,
        quantity: item.quantity,
        unit: item.unit,
        minimumStockLevel: item.minimumStockLevel
      }));
    },

    kpiGrowth: async (_, args, { req }) => {
      await auth(req);

      const current = getMonthRange(0);
      const previous = getMonthRange(1);

      const currentInvoices = await Invoice.aggregate([
        {
          $match: {
            createdAt: {
              $gte: current.start,
              $lt: current.end
            }
          }
        },
        {
          $group: {
            _id: null,
            invoiceValue: { $sum: "$grandTotal" },
            revenue: { $sum: "$amountPaid" },
            outstanding: { $sum: "$balance" }
          }
        }
      ]);

      const previousInvoices = await Invoice.aggregate([
        {
          $match: {
            createdAt: {
              $gte: previous.start,
              $lt: previous.end
            }
          }
        },
        {
          $group: {
            _id: null,
            invoiceValue: { $sum: "$grandTotal" },
            revenue: { $sum: "$amountPaid" },
            outstanding: { $sum: "$balance" }
          }
        }
      ]);

      const currentPayments = await Payment.aggregate([
        {
          $match: {
            createdAt: {
              $gte: current.start,
              $lt: current.end
            }
          }
        },
        {
          $group: {
            _id: null,
            payments: { $sum: "$amount" }
          }
        }
      ]);

      const previousPayments = await Payment.aggregate([
        {
          $match: {
            createdAt: {
              $gte: previous.start,
              $lt: previous.end
            }
          }
        },
        {
          $group: {
            _id: null,
            payments: { $sum: "$amount" }
          }
        }
      ]);

      const currentRevenue = currentInvoices[0]?.revenue || 0;
      const previousRevenue = previousInvoices[0]?.revenue || 0;

      const currentInvoiceValue = currentInvoices[0]?.invoiceValue || 0;
      const previousInvoiceValue = previousInvoices[0]?.invoiceValue || 0;

      const currentPaymentValue = currentPayments[0]?.payments || 0;
      const previousPaymentValue = previousPayments[0]?.payments || 0;

      const currentOutstanding = currentInvoices[0]?.outstanding || 0;
      const previousOutstanding = previousInvoices[0]?.outstanding || 0;

      return {
        revenueGrowth: percentGrowth(currentRevenue, previousRevenue),
        invoiceGrowth: percentGrowth(currentInvoiceValue, previousInvoiceValue),
        paymentGrowth: percentGrowth(currentPaymentValue, previousPaymentValue),
        outstandingGrowth: percentGrowth(currentOutstanding, previousOutstanding),
        currentRevenue,
        previousRevenue,
        currentInvoiceValue,
        previousInvoiceValue,
        currentPayments: currentPaymentValue,
        previousPayments: previousPaymentValue,
        currentOutstanding,
        previousOutstanding
      };
    },

    revenueForecast: async (_, args, { req }) => {
      await auth(req);

      const monthly = await Invoice.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            revenueReceived: { $sum: "$amountPaid" }
          }
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1
          }
        }
      ]);

      const values = monthly.map((item) => item.revenueReceived || 0);

      if (values.length === 0) {
        return {
          nextMonthForecast: 0,
          averageMonthlyRevenue: 0,
          bestMonthRevenue: 0,
          worstMonthRevenue: 0
        };
      }

      const total = values.reduce((sum, value) => sum + value, 0);
      const average = total / values.length;

      const recentValues = values.slice(-3);
      const recentAverage =
        recentValues.reduce((sum, value) => sum + value, 0) /
        recentValues.length;

      return {
        nextMonthForecast: Number(recentAverage.toFixed(2)),
        averageMonthlyRevenue: Number(average.toFixed(2)),
        bestMonthRevenue: Math.max(...values),
        worstMonthRevenue: Math.min(...values)
      };
    },

    analyticsReport: async (_, args, { req }) => {
      await auth(req);

      const revenue = await Invoice.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$amountPaid" },
            outstandingBalance: { $sum: "$balance" }
          }
        }
      ]);

      const totalInvoices = await Invoice.countDocuments();
      const totalPayments = await Payment.countDocuments();

      const lowStockCount = await Inventory.countDocuments({
        $expr: {
          $lte: ["$quantity", "$minimumStockLevel"]
        }
      });

      return {
        totalRevenue: revenue[0]?.totalRevenue || 0,
        totalInvoices,
        totalPayments,
        outstandingBalance: revenue[0]?.outstandingBalance || 0,
        lowStockCount,
        generatedAt: new Date().toISOString()
      };
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
          title: payment.paymentNumber || "Payment received",
          description: `KES ${payment.amount || 0} received from ${
            payment.customer?.fullName || "customer"
          }`,
          createdAt: payment.createdAt
        })),

        ...recentInvoices.map((invoice) => ({
          type: "INVOICE",
          title: invoice.invoiceNumber || "Invoice created",
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