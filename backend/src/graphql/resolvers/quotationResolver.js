import Quotation from "../../models/quotation.js";
import Customer from "../../models/customer.js";
import auth from "../../middleware/auth.js";
import authorize from "../../middleware/roles.js";
import generateQuotationPDF from "../../utils/generateQuotationPDF.js";

const generateQuotationNumber = () => {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `QT-${Date.now()}-${random}`;
};

const quotationResolver = {
  Query: {
    quotations: async (_, args, { req }) => {
      await auth(req);

      return await Quotation.find()
        .populate("customer")
        .populate("project")
        .populate("createdBy")
        .sort({ createdAt: -1 });
    },

    quotation: async (_, { id }, { req }) => {
      await auth(req);

      const quotation = await Quotation.findById(id)
        .populate("customer")
        .populate("project")
        .populate("createdBy");

      if (!quotation) {
        throw new Error("Quotation not found");
      }

      return quotation;
    }
  },

  Mutation: {
    createQuotation: async (_, args, { req }) => {
      const user = await auth(req);

      authorize("ADMIN", "MANAGER")(user);

      const customer = await Customer.findById(args.customer);

      if (!customer) {
        throw new Error("Customer not found");
      }

      const items = args.items.map((item) => ({
        itemName: item.itemName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice
      }));

      const itemsTotal = items.reduce((sum, item) => sum + item.total, 0);

      const laborCost = args.laborCost || 0;
      const transportCost = args.transportCost || 0;
      const tax = args.tax || 0;

      const subtotal = itemsTotal + laborCost + transportCost;
      const grandTotal = subtotal + tax;

      const quotation = await Quotation.create({
        customer: args.customer,
        quotationNumber: generateQuotationNumber(),
        items,
        laborCost,
        transportCost,
        subtotal,
        tax,
        grandTotal,
        notes: args.notes,
        createdBy: user._id
      });

      return await Quotation.findById(quotation._id)
        .populate("customer")
        .populate("project")
        .populate("createdBy");
    },

    updateQuotationStatus: async (_, { id, status }, { req }) => {
      const user = await auth(req);

      authorize("ADMIN", "MANAGER")(user);

      const quotation = await Quotation.findByIdAndUpdate(
        id,
        { status },
        {
          new: true,
          runValidators: true
        }
      )
        .populate("customer")
        .populate("project")
        .populate("createdBy");

      if (!quotation) {
        throw new Error("Quotation not found");
      }

      return quotation;
    },

    generateQuotationPDF: async (_, { id }, { req }) => {
      const user = await auth(req);

      authorize("ADMIN", "MANAGER")(user);

      const quotation = await Quotation.findById(id)
        .populate("customer")
        .populate("project")
        .populate("createdBy");

      if (!quotation) {
        throw new Error("Quotation not found");
      }

      const pdfUrl = await generateQuotationPDF(quotation);

      return pdfUrl;
    },

    deleteQuotation: async (_, { id }, { req }) => {
      const user = await auth(req);

      authorize("ADMIN")(user);

      const quotation = await Quotation.findByIdAndDelete(id);

      if (!quotation) {
        throw new Error("Quotation not found");
      }

      return "Quotation deleted successfully";
    }
  }
};

export default quotationResolver;