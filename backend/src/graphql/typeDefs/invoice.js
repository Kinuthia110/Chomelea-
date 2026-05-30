const invoiceType = `#graphql

type InvoiceItem {
  itemName: String
  quantity: Float
  unitPrice: Float
  total: Float
}

input InvoiceItemInput {
  itemName: String!
  quantity: Float!
  unitPrice: Float!
}

type Invoice {
  id: ID!
  invoiceNumber: String
  customer: Customer
  project: Project
  quotation: Quotation
  items: [InvoiceItem]
  subtotal: Float
  tax: Float
  grandTotal: Float
  amountPaid: Float
  balance: Float
  paymentStatus: String
  invoiceStatus: String
  dueDate: String
  notes: String
  createdBy: User
  createdAt: String
  updatedAt: String
}

type Query {
  invoices: [Invoice]
  invoice(id: ID!): Invoice
}

type Mutation {
  createInvoice(
    customer: ID!
    quotation: ID
    project: ID
    items: [InvoiceItemInput!]!
    tax: Float
    dueDate: String
    notes: String
  ): Invoice

  updateInvoice(
    id: ID!
    customer: ID
    quotation: ID
    project: ID
    items: [InvoiceItemInput!]
    tax: Float
    dueDate: String
    notes: String
    paymentStatus: String
    invoiceStatus: String
  ): Invoice

  deleteInvoice(id: ID!): Boolean
}

`;

export default invoiceType;