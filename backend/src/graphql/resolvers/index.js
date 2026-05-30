import testResolver from "./testResolver.js";
import authResolver from "./authResolver.js";
import meResolver from "./meResolver.js";
import adminResolver from "./adminResolver.js";
import customerResolver from "./customerResolver.js";
import projectResolver from "./projectResolver.js";
import quotationResolver from "./quotationResolver.js";
import invoiceResolver from "./invoiceResolver.js";
import paymentResolver from "./paymentResolver.js";
import inventoryResolver from "./inventoryResolver.js";
import analyticsResolver from "./analyticsResolver.js";
import notificationResolver from "./notificationResolver.js";
import userResolver from "./userResolver.js";

const resolvers = [
  testResolver,
  authResolver,
  meResolver,
  adminResolver,
  customerResolver,
  projectResolver,
  quotationResolver,
  invoiceResolver,
  paymentResolver,
  inventoryResolver,
  analyticsResolver,
  notificationResolver,
  userResolver
];

export default resolvers;