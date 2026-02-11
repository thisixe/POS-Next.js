import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
    name: string;
    nameEn: string;
    slug: string;
    description?: string;
    descriptionEn?: string;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
    {
        name: { type: String, required: true }, // Thai name
        nameEn: { type: String, required: true }, // English name
        slug: { type: String, required: true, unique: true },
        description: { type: String },
        descriptionEn: { type: String },
        image: { type: String },
    },
    { timestamps: true }
);

export const Category = mongoose.model<ICategory>('Category', CategorySchema);
