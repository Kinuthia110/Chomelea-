const projectType = `#graphql

type Measurements {
  width: Float
  height: Float
  unit: String
}

type Project {
  id: ID!
  customer: Customer!
  projectTitle: String!
  description: String
  category: String
  status: String
  measurements: Measurements
  totalCost: Float
  depositPaid: Float
  balance: Float
  assignedWorkers: [User]
  startDate: String
  deadline: String
  completionDate: String
  images: [String]
  createdBy: User
  createdAt: String
  updatedAt: String
}

type Query {
  projects: [Project]
  project(id: ID!): Project
  projectsByStatus(status: String!): [Project]
}

type Mutation {
  createProject(
    customer: ID!
    projectTitle: String!
    description: String
    location: String
    startDate: String
    endDate: String
    status: String
    budget: Float
  ): Project

  updateProject(
    id: ID!
    customer: ID
    projectTitle: String
    description: String
    location: String
    startDate: String
    endDate: String
    status: String
    budget: Float
  ): Project

  deleteProject(id: ID!): Boolean
}

`;

export default projectType;