import Payment from "../../models/payment.js";
import Invoice from "../../models/invoice.js";
import Customer from "../../models/customer.js";
import auth from "../../middleware/auth.js";
import authorize from "../../middleware/roles.js";

const generatePaymentNumber = () => {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `PAY-${Date.now()}-${random}`;
};

const populatePayment = (query) => {
  return query
    .populate("customer")
    .populate("invoice")
    .populate("project")
    .populate("receivedBy");
};

const updateInvoiceAfterPayment = async (invoiceId, amount) => {
  if (!invoiceId) return;

  const invoice = await Invoice.findById(invoiceId);

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  invoice.amountPaid += amount;
  invoice.balance = invoice.grandTotal - invoice.amountPaid;

  if (invoice.amountPaid <= 0) {
    invoice.paymentStatus = "UNPAID";
  } else if (invoice.balance > 0) {
    invoice.paymentStatus = "PARTIAL";
  } else {
    invoice.paymentStatus = "PAID";
    invoice.balance = 0;
  }

  await invoice.save();
};

const paymentResolver = {
  Query: {
    payments: async (_, args, { req }) => {
      await auth(req);

      return await populatePayment(
        Payment.find().sort({ createdAt: -1 })
      );
    },

    payment: async (_, { id }, { req }) => {
      await auth(req);

      const payment = await populatePayment(Payment.findById(id));

      if (!payment) {
        throw new Error("Payment not found");
      }

      return payment;
    },

    paymentsByCustomer: async (_, { customer }, { req }) => {
      await auth(req);

      return await populatePayment(
        Payment.find({ customer }).sort({ createdAt: -1 })
      );
    },

    paymentsByInvoice: async (_, { invoice }, { req }) => {
      await auth(req);

      return await populatePayment(
        Payment.find({ invoice }).sort({ createdAt: -1 })
      );
    }
  },

  Mutation: {
    recordPayment: async (_, args, { req }) => {
      const user = await auth(req);

      authorize("ADMIN", "MANAGER")(user);

      const customerExists = await Customer.findById(args.customer);

      if (!customerExists) {
        throw new Error("Customer not found");
      }

      const payment = await Payment.create({
        paymentNumber: generatePaymentNumber(),
        customer: args.customer,
        invoice: args.invoice,
        project: args.project,
        amount: args.amount,
        paymentMethod: args.paymentMethod || "CASH",
        transactionCode: args.transactionCode,
        notes: args.notes,
        receivedBy: user._id
      });

      if (args.invoice) {
        await updateInvoiceAfterPayment(args.invoice, args.amount);
      }

      return await populatePayment(Payment.findById(payment._id));
    },

    deletePayment: async (_, { id }, { req }) => {
      const user = await auth(req);

      authorize("ADMIN")(user);

      const payment = await Payment.findById(id);

      if (!payment) {
        throw new Error("Payment not found");
      }

      if (payment.invoice) {
        await updateInvoiceAfterPayment(payment.invoice, -payment.amount);
      }

      await Payment.findByIdAndDelete(id);

      return "Payment deleted successfully";
    }
  }
};

export default paymentResolver;