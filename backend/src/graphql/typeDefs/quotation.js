const quotationType = `#graphql

type QuotationItem {
  itemName: String
  quantity: Float
  unitPrice: Float
  total: Float
}

input QuotationItemInput {
  itemName: String!
  quantity: Float!
  unitPrice: Float!
}

type Quotation {
  id: ID!
  quotationNumber: String
  customer: Customer
  project: Project
  items: [QuotationItem]
  laborCost: Float
  transportCost: Float
  subtotal: Float
  tax: Float
  grandTotal: Float
  status: String
  notes: String
  createdBy: User
  createdAt: String
  updatedAt: String
}

type Query {
  quotations: [Quotation]
  quotation(id: ID!): Quotation
}

type Mutation {
  createQuotation(
    customer: ID!
    items: [QuotationItemInput!]!
    laborCost: Float
    transportCost: Float
    tax: Float
    notes: String
  ): Quotation

  updateQuotation(
    id: ID!
    customer: ID
    items: [QuotationItemInput!]
    laborCost: Float
    transportCost: Float
    tax: Float
    notes: String
    status: String
  ): Quotation

  approveQuotation(id: ID!): Quotation

  rejectQuotation(id: ID!): Quotation

  deleteQuotation(id: ID!): Boolean
}

`;

export default quotationType;