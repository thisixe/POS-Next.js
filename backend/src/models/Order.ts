import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IOrderItem {
    product: Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

export interface IOrder extends Document {
    user: Types.ObjectId;
    orderNumber: string;
    items: IOrderItem[];
    subtotal: number;
    shippingFee: number;
    total: number;
    status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    paymentMethod: 'promptpay' | 'credit_card' | 'bank_transfer';
    paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
    shippingAddress: {
        name: string;
        phone: string;
        address: string;
        district: string;
        province: string;
        postalCode: string;
    };
    trackingNumber?: string;
    paymentSlip?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String },
});

const OrderSchema = new Schema<IOrder>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        orderNumber: { type: String, required: true, unique: true },
        items: [OrderItemSchema],
        subtotal: { type: Number, required: true },
        shippingFee: { type: Number, default: 0 },
        total: { type: Number, required: true },
        status: {
            type: String,
            enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'],
            default: 'pending',
        },
        paymentMethod: {
            type: String,
            enum: ['promptpay', 'credit_card', 'bank_transfer'],
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: 'pending',
        },
        shippingAddress: {
            name: { type: String, required: true },
            phone: { type: String, required: true },
            address: { type: String, required: true },
            district: { type: String, required: true },
            province: { type: String, required: true },
            postalCode: { type: String, required: true },
        },
        trackingNumber: { type: String },
        paymentSlip: { type: String },
        notes: { type: String },
    },
    { timestamps: true }
);

// Generate order number before saving
OrderSchema.pre('save', async function (next) {
    if (!this.orderNumber) {
        const date = new Date();
        const prefix = `KHN${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
        const count = await mongoose.model('Order').countDocuments();
        this.orderNumber = `${prefix}${String(count + 1).padStart(5, '0')}`;
    }
    next();
});

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
