import jwt from 'jsonwebtoken';
import { Category, Product, User, Order } from '../models';
import { GraphQLError } from 'graphql';

const JWT_SECRET = process.env.JWT_SECRET || 'admin.Bamrungwong';

// Helper to generate JWT token
const generateToken = (userId: string): string => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Helper to check authentication
const requireAuth = (context: any) => {
    if (!context.user) {
        throw new GraphQLError('กรุณาเข้าสู่ระบบก่อน / Please login first', {
            extensions: { code: 'UNAUTHENTICATED' },
        });
    }
    return context.user;
};

// Helper to check admin role
const requireAdmin = (context: any) => {
    const user = requireAuth(context);
    if (user.role !== 'admin') {
        throw new GraphQLError('ไม่มีสิทธิ์เข้าถึง / Access denied', {
            extensions: { code: 'FORBIDDEN' },
        });
    }
    return user;
};

export const resolvers = {
    Query: {
        // Categories
        categories: async () => {
            return Category.find().sort({ name: 1 });
        },

        category: async (_: any, { slug }: { slug: string }) => {
            return Category.findOne({ slug });
        },

        // Products
        products: async (
            _: any,
            { category, featured, search, limit = 20, offset = 0 }: any
        ) => {
            const query: any = {};

            if (category) {
                const cat = await Category.findOne({ slug: category });
                if (cat) query.category = cat._id;
            }

            if (featured !== undefined) query.featured = featured;

            if (search) {
                query.$text = { $search: search };
            }

            const [products, total] = await Promise.all([
                Product.find(query)
                    .populate('category')
                    .sort({ createdAt: -1 })
                    .skip(offset)
                    .limit(limit),
                Product.countDocuments(query),
            ]);

            return {
                products,
                total,
                hasMore: offset + products.length < total,
            };
        },

        product: async (_: any, { id, slug }: { id?: string; slug?: string }) => {
            if (id) return Product.findById(id).populate('category');
            if (slug) return Product.findOne({ slug }).populate('category');
            return null;
        },

        // User
        me: async (_: any, __: any, context: any) => {
            return context.user;
        },

        myOrders: async (_: any, __: any, context: any) => {
            const user = requireAuth(context);
            return Order.find({ user: user._id })
                .populate('items.product')
                .sort({ createdAt: -1 });
        },

        order: async (_: any, { id }: { id: string }, context: any) => {
            const user = requireAuth(context);
            const order = await Order.findById(id).populate('items.product');

            if (!order) {
                throw new GraphQLError('ไม่พบคำสั่งซื้อ / Order not found');
            }

            if (order.user.toString() !== user._id.toString() && user.role !== 'admin') {
                throw new GraphQLError('ไม่มีสิทธิ์เข้าถึง / Access denied');
            }

            return order;
        },

        // Admin
        adminProducts: async (_: any, { limit = 20, offset = 0 }: any, context: any) => {
            requireAdmin(context);

            const [products, total] = await Promise.all([
                Product.find()
                    .populate('category')
                    .sort({ createdAt: -1 })
                    .skip(offset)
                    .limit(limit),
                Product.countDocuments(),
            ]);

            return { products, total, hasMore: offset + products.length < total };
        },

        adminOrders: async (
            _: any,
            { status, limit = 20, offset = 0 }: any,
            context: any
        ) => {
            requireAdmin(context);

            const query: any = {};
            if (status) query.status = status;

            const [orders, total] = await Promise.all([
                Order.find(query)
                    .populate('user')
                    .populate('items.product')
                    .sort({ createdAt: -1 })
                    .skip(offset)
                    .limit(limit),
                Order.countDocuments(query),
            ]);

            return { orders, total, hasMore: offset + orders.length < total };
        },

        adminDashboard: async (_: any, __: any, context: any) => {
            requireAdmin(context);

            const [totalProducts, totalOrders, pendingOrders, recentOrders, revenueResult, lowStockProducts] =
                await Promise.all([
                    Product.countDocuments(),
                    Order.countDocuments(),
                    Order.countDocuments({ status: 'pending' }),
                    Order.find()
                        .populate('user')
                        .sort({ createdAt: -1 })
                        .limit(5),
                    Order.aggregate([
                        { $match: { paymentStatus: 'completed' } },
                        { $group: { _id: null, total: { $sum: '$total' } } },
                    ]),
                    Product.find({ stock: { $lt: 10 } }).limit(5),
                ]);

            // Calculate monthly revenue for the last 6 months
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const monthlyRevenueResult = await Order.aggregate([
                {
                    $match: {
                        paymentStatus: 'completed',
                        createdAt: { $gte: sixMonthsAgo }
                    }
                },
                {
                    $group: {
                        _id: {
                            month: { $month: '$createdAt' },
                            year: { $year: '$createdAt' }
                        },
                        revenue: { $sum: '$total' }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]);

            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthlyRevenue = monthlyRevenueResult.map(item => ({
                month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
                revenue: item.revenue
            }));

            return {
                totalProducts,
                totalOrders,
                totalRevenue: revenueResult[0]?.total || 0,
                pendingOrders,
                recentOrders,
                monthlyRevenue,
                lowStockProducts,
            };
        },
    },

    Mutation: {
        // Auth
        register: async (
            _: any,
            { email, password, name }: { email: string; password: string; name: string }
        ) => {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw new GraphQLError('อีเมลนี้ถูกใช้งานแล้ว / Email already exists');
            }

            const user = await User.create({ email, password, name });
            const token = generateToken(user._id.toString());

            return { token, user };
        },

        login: async (
            _: any,
            { email, password }: { email: string; password: string }
        ) => {
            const user = await User.findOne({ email }).select('+password');
            if (!user) {
                throw new GraphQLError('อีเมลหรือรหัสผ่านไม่ถูกต้อง / Invalid credentials');
            }

            const isValid = await user.comparePassword(password);
            if (!isValid) {
                throw new GraphQLError('อีเมลหรือรหัสผ่านไม่ถูกต้อง / Invalid credentials');
            }

            const token = generateToken(user._id.toString());
            return { token, user };
        },

        // User Profile
        updateProfile: async (
            _: any,
            { name, phone }: { name?: string; phone?: string },
            context: any
        ) => {
            const user = requireAuth(context);
            if (name) user.name = name;
            if (phone) user.phone = phone;
            await user.save();
            return user;
        },

        addAddress: async (_: any, { address }: any, context: any) => {
            const user = requireAuth(context);

            if (address.isDefault) {
                user.addresses.forEach((addr: any) => (addr.isDefault = false));
            }

            user.addresses.push(address);
            await user.save();
            return user;
        },

        updateAddress: async (_: any, { index, address }: any, context: any) => {
            const user = requireAuth(context);

            if (index < 0 || index >= user.addresses.length) {
                throw new GraphQLError('ไม่พบที่อยู่ / Address not found');
            }

            if (address.isDefault) {
                user.addresses.forEach((addr: any) => (addr.isDefault = false));
            }

            user.addresses[index] = { ...user.addresses[index], ...address };
            await user.save();
            return user;
        },

        deleteAddress: async (_: any, { index }: { index: number }, context: any) => {
            const user = requireAuth(context);

            if (index < 0 || index >= user.addresses.length) {
                throw new GraphQLError('ไม่พบที่อยู่ / Address not found');
            }

            user.addresses.splice(index, 1);
            await user.save();
            return user;
        },

        // Orders
        createOrder: async (_: any, { input }: any, context: any) => {
            const user = requireAuth(context);

            // Get products and calculate totals
            const items = await Promise.all(
                input.items.map(async (item: any) => {
                    const product = await Product.findById(item.product);
                    if (!product) {
                        throw new GraphQLError(`ไม่พบสินค้า / Product not found: ${item.product}`);
                    }
                    if (product.stock < item.quantity) {
                        throw new GraphQLError(`สินค้า ${product.name} มีไม่เพียงพอ / Insufficient stock`);
                    }

                    return {
                        product: product._id,
                        name: product.name,
                        price: product.discountPrice || product.price,
                        quantity: item.quantity,
                        image: product.images[0],
                    };
                })
            );

            const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const shippingFee = subtotal >= 1000 ? 0 : 50; // Free shipping over 1000 baht
            const total = subtotal + shippingFee;

            const order = await Order.create({
                user: user._id,
                items,
                subtotal,
                shippingFee,
                total,
                shippingAddress: input.shippingAddress,
                paymentMethod: input.paymentMethod,
                notes: input.notes,
            });

            // Decrease stock
            for (const item of input.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: -item.quantity },
                });
            }

            return order.populate('items.product');
        },

        // Admin - Categories
        createCategory: async (_: any, { input }: any, context: any) => {
            requireAdmin(context);
            return Category.create(input);
        },

        updateCategory: async (_: any, { id, input }: any, context: any) => {
            requireAdmin(context);
            return Category.findByIdAndUpdate(id, input, { new: true });
        },

        deleteCategory: async (_: any, { id }: { id: string }, context: any) => {
            requireAdmin(context);

            const productsCount = await Product.countDocuments({ category: id });
            if (productsCount > 0) {
                throw new GraphQLError('ไม่สามารถลบหมวดหมู่ที่มีสินค้าได้ / Cannot delete category with products');
            }

            await Category.findByIdAndDelete(id);
            return true;
        },

        // Admin - Products
        createProduct: async (_: any, { input }: any, context: any) => {
            requireAdmin(context);

            const specs = input.specifications?.reduce((acc: any, spec: any) => {
                acc[spec.key] = spec.value;
                return acc;
            }, {});

            return Product.create({ ...input, specifications: specs });
        },

        updateProduct: async (_: any, { id, input }: any, context: any) => {
            requireAdmin(context);

            const specs = input.specifications?.reduce((acc: any, spec: any) => {
                acc[spec.key] = spec.value;
                return acc;
            }, {});

            return Product.findByIdAndUpdate(
                id,
                { ...input, specifications: specs },
                { new: true }
            ).populate('category');
        },

        deleteProduct: async (_: any, { id }: { id: string }, context: any) => {
            requireAdmin(context);
            await Product.findByIdAndDelete(id);
            return true;
        },

        // Admin - Orders
        updateOrderStatus: async (
            _: any,
            { id, status }: { id: string; status: string },
            context: any
        ) => {
            requireAdmin(context);
            return Order.findByIdAndUpdate(id, { status }, { new: true })
                .populate('user')
                .populate('items.product');
        },

        updateTrackingNumber: async (
            _: any,
            { id, trackingNumber }: { id: string; trackingNumber: string },
            context: any
        ) => {
            requireAdmin(context);
            return Order.findByIdAndUpdate(id, { trackingNumber }, { new: true })
                .populate('user')
                .populate('items.product');
        },

        updatePaymentStatus: async (
            _: any,
            { id, status }: { id: string; status: string },
            context: any
        ) => {
            requireAdmin(context);
            return Order.findByIdAndUpdate(id, { paymentStatus: status }, { new: true })
                .populate('user')
                .populate('items.product');
        },

        uploadPaymentSlip: async (
            _: any,
            { id, slipUrl }: { id: string; slipUrl: string },
            context: any
        ) => {
            requireAuth(context);
            // Any user can upload to their own order, or admin can upload to any
            const order = await Order.findById(id);
            if (!order) throw new GraphQLError('Order not found');

            const user = context.user;
            if (order.user.toString() !== user._id.toString() && user.role !== 'admin') {
                throw new GraphQLError('Access denied');
            }

            return Order.findByIdAndUpdate(id, {
                paymentSlip: slipUrl,
                status: 'paid' // Automatically move to paid status? 
                // Actually maybe better to keep it 'pending' until admin confirms.
                // But the user said "กดยืนยันยอดเงินได้", so 'pending' is better.
            }, { new: true })
                .populate('user')
                .populate('items.product');
        },
    },

    // Field resolvers
    Product: {
        specifications: (product: any) => {
            if (!product.specifications) return [];

            // Allow for Map or basic Object
            let entries: [string, any][];
            if (product.specifications instanceof Map) {
                entries = Array.from(product.specifications.entries()) as [string, any][];
            } else if (typeof product.specifications === 'object') {
                entries = Object.entries(product.specifications);
            } else {
                return [];
            }

            return entries.map(([key, value]) => ({
                key,
                value: String(value),
            }));
        },
    },

    Category: {
        productCount: async (category: any) => {
            return Product.countDocuments({ category: category._id });
        },
    },
};
