const analyticsType = `#graphql

type RevenueSummary {
  totalInvoiceValue: Float
  totalRevenueReceived: Float
  outstandingBalance: Float
  paidInvoices: Int
  partialInvoices: Int
  unpaidInvoices: Int
}

type DashboardStats {
  totalCustomers: Int
  totalProjects: Int
  activeProjects: Int
  completedProjects: Int
  totalQuotations: Int
  approvedQuotations: Int
  totalInvoices: Int
  totalPayments: Int
  lowStockCount: Int
}

type MonthlyRevenue {
  month: String
  invoiceValue: Float
  revenueReceived: Float
  outstandingBalance: Float
}

type ProjectStatusCount {
  status: String
  count: Int
}

type TopCustomer {
  customerName: String
  totalSpent: Float
  invoiceCount: Int
}

type DashboardLowStockItem {
  itemName: String
  quantity: Float
  unit: String
  minimumStockLevel: Float
}

type RecentActivity {
  type: String
  title: String
  description: String
  createdAt: String
}

type KpiGrowth {
  revenueGrowth: Float
  invoiceGrowth: Float
  paymentGrowth: Float
  outstandingGrowth: Float
  currentRevenue: Float
  previousRevenue: Float
  currentInvoiceValue: Float
  previousInvoiceValue: Float
  currentPayments: Float
  previousPayments: Float
  currentOutstanding: Float
  previousOutstanding: Float
}

type RevenueForecast {
  nextMonthForecast: Float
  averageMonthlyRevenue: Float
  bestMonthRevenue: Float
  worstMonthRevenue: Float
}

type AnalyticsReport {
  totalRevenue: Float
  totalInvoices: Int
  totalPayments: Int
  outstandingBalance: Float
  lowStockCount: Int
  generatedAt: String
}

type Query {
  revenueSummary: RevenueSummary
  dashboardStats: DashboardStats
  monthlyRevenue: [MonthlyRevenue]
  projectStatusCounts: [ProjectStatusCount]
  topCustomers: [TopCustomer]
  dashboardLowStockItems: [DashboardLowStockItem]
  recentActivities: [RecentActivity]
  kpiGrowth: KpiGrowth
  revenueForecast: RevenueForecast
  analyticsReport: AnalyticsReport
}

`;

export default analyticsType;