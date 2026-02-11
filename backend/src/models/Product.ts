import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    nameEn: string;
    slug: string;
    description: string;
    descriptionEn: string;
    price: number;
    discountPrice?: number;
    category: Types.ObjectId;
    brand: string;
    images: string[];
    specifications: Record<string, string>;
    stock: number;
    featured: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
    {
        name: { type: String, required: true }, // Thai name
        nameEn: { type: String, required: true }, // English name
        slug: { type: String, required: true, unique: true },
        description: { type: String, required: true },
        descriptionEn: { type: String, required: true },
        price: { type: Number, required: true },
        discountPrice: { type: Number },
        category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
        brand: { type: String, required: true },
        images: [{ type: String }],
        specifications: { type: Map, of: String },
        stock: { type: Number, default: 0 },
        featured: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Index for search functionality
ProductSchema.index({ name: 'text', nameEn: 'text', description: 'text' });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
