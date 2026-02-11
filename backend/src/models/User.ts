import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAddress {
    name: string;
    phone: string;
    address: string;
    district: string;
    province: string;
    postalCode: string;
    isDefault: boolean;
}

export interface IUser extends Document {
    email: string;
    password: string;
    name: string;
    phone?: string;
    addresses: IAddress[];
    role: 'customer' | 'admin';
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const AddressSchema = new Schema<IAddress>({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    district: { type: String, required: true },
    province: { type: String, required: true },
    postalCode: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
});

const UserSchema = new Schema<IUser>(
    {
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true, select: false },
        name: { type: String, required: true },
        phone: { type: String },
        addresses: [AddressSchema],
        role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    },
    { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
