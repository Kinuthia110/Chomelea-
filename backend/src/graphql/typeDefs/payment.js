const paymentType = `#graphql

type Payment {
  id: ID!
  paymentNumber: String
  customer: Customer
  invoice: Invoice
  project: Project
  amount: Float
  paymentMethod: String
  transactionCode: String
  notes: String
  receivedBy: User
  createdAt: String
  updatedAt: String
}

type Query {
  payments: [Payment]
  payment(id: ID!): Payment
  paymentsByCustomer(customer: ID!): [Payment]
  paymentsByInvoice(invoice: ID!): [Payment]
}

type Mutation {
  createPayment(
    customer: ID!
    invoice: ID
    project: ID
    amount: Float!
    paymentMethod: String
    transactionCode: String
    notes: String
  ): Payment

  updatePayment(
    id: ID!
    customer: ID
    invoice: ID
    project: ID
    amount: Float
    paymentMethod: String
    transactionCode: String
    notes: String
  ): Payment

  deletePayment(id: ID!): Boolean
}

`;

export default paymentType;