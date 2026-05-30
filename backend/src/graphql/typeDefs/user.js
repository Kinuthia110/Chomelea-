const userType = `#graphql

type User {
  id: ID
  fullName: String
  email: String
  role: String
  createdAt: String
  updatedAt: String
}

type Query {
  users: [User]
  user(id: ID!): User
}

type Mutation {
  createUser(
    fullName: String!
    email: String!
    password: String!
    role: String!
  ): User

  updateUserRole(
    id: ID!
    role: String!
  ): User

  deleteUser(
    id: ID!
  ): Boolean
}

`;

export default userType;