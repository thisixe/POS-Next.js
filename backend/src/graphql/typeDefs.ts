export const typeDefs = `#graphql
  # ==================== Types ====================
  
  type Category {
    id: ID!
    name: String!
    nameEn: String!
    slug: String!
    description: String
    descriptionEn: String
    image: String
    productCount: Int
    createdAt: String!
    updatedAt: String!
  }

  type Product {
    id: ID!
    name: String!
    nameEn: String!
    slug: String!
    description: String!
    descriptionEn: String!
    price: Float!
    discountPrice: Float
    category: Category
    brand: String!
    images: [String!]!
    specifications: [Specification!]
    stock: Int!
    featured: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Specification {
    key: String!
    value: String!
  }

  type User {
    id: ID!
    email: String!
    name: String!
    phone: String
    addresses: [Address!]!
    role: String!
    createdAt: String!
  }

  type Address {
    name: String!
    phone: String!
    address: String!
    district: String!
    province: String!
    postalCode: String!
    isDefault: Boolean!
  }

  type OrderItem {
    product: Product!
    name: String!
    price: Float!
    quantity: Int!
    image: String
  }

  type Order {
    id: ID!
    orderNumber: String!
    user: User!
    items: [OrderItem!]!
    subtotal: Float!
    shippingFee: Float!
    total: Float!
    status: String!
    paymentMethod: String!
    paymentStatus: String!
    shippingAddress: Address!
    trackingNumber: String
    paymentSlip: String
    notes: String
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  # ==================== Inputs ====================

  input ProductInput {
    name: String!
    nameEn: String!
    slug: String!
    description: String!
    descriptionEn: String!
    price: Float!
    discountPrice: Float
    category: ID!
    brand: String!
    images: [String!]
    specifications: [SpecificationInput!]
    stock: Int!
    featured: Boolean
  }

  input SpecificationInput {
    key: String!
    value: String!
  }

  input CategoryInput {
    name: String!
    nameEn: String!
    slug: String!
    description: String
    descriptionEn: String
    image: String
  }

  input AddressInput {
    name: String!
    phone: String!
    address: String!
    district: String!
    province: String!
    postalCode: String!
    isDefault: Boolean
  }

  input OrderItemInput {
    product: ID!
    quantity: Int!
  }

  input CreateOrderInput {
    items: [OrderItemInput!]!
    shippingAddress: AddressInput!
    paymentMethod: String!
    notes: String
  }

  # ==================== Queries ====================

  type Query {
    # Categories
    categories: [Category!]!
    category(slug: String!): Category

    # Products
    products(
      category: String
      featured: Boolean
      search: String
      limit: Int
      offset: Int
    ): ProductsResponse!
    product(id: ID, slug: String): Product

    # User
    me: User
    myOrders: [Order!]!
    order(id: ID!): Order

    # Admin
    adminProducts(limit: Int, offset: Int): ProductsResponse!
    adminOrders(status: String, limit: Int, offset: Int): OrdersResponse!
    adminDashboard: DashboardStats!
  }

  type ProductsResponse {
    products: [Product!]!
    total: Int!
    hasMore: Boolean!
  }

  type OrdersResponse {
    orders: [Order!]!
    total: Int!
    hasMore: Boolean!
  }

  type DashboardStats {
    totalProducts: Int!
    totalOrders: Int!
    totalRevenue: Float!
    pendingOrders: Int!
    recentOrders: [Order!]!
    monthlyRevenue: [MonthlyRevenue!]!
    lowStockProducts: [Product!]!
  }

  type MonthlyRevenue {
    month: String!
    revenue: Float!
  }

  # ==================== Mutations ====================

  type Mutation {
    # Auth
    register(email: String!, password: String!, name: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!

    # User
    updateProfile(name: String, phone: String): User!
    addAddress(address: AddressInput!): User!
    updateAddress(index: Int!, address: AddressInput!): User!
    deleteAddress(index: Int!): User!

    # Orders
    createOrder(input: CreateOrderInput!): Order!

    # Admin - Categories
    createCategory(input: CategoryInput!): Category!
    updateCategory(id: ID!, input: CategoryInput!): Category!
    deleteCategory(id: ID!): Boolean!

    # Admin - Products
    createProduct(input: ProductInput!): Product!
    updateProduct(id: ID!, input: ProductInput!): Product!
    deleteProduct(id: ID!): Boolean!

    # Admin - Orders
    updateOrderStatus(id: ID!, status: String!): Order!
    updateTrackingNumber(id: ID!, trackingNumber: String!): Order!
    updatePaymentStatus(id: ID!, status: String!): Order!
    uploadPaymentSlip(id: ID!, slipUrl: String!): Order!
  }
`;
