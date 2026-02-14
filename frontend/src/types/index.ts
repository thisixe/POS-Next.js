export interface Category {
    id: string;
    name: string;
    nameEn: string;
    slug: string;
}

export type UserRole = 'customer' | 'admin';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}

export interface Product {
    id: string;
    name: string;
    nameEn: string;
    slug: string;
    brand: string;
    price: number;
    discountPrice?: number;
    category: Category;
    images: string[];
    stock: number;
    description: string;
    descriptionEn: string;
    featured: boolean;
    specifications?: { key: string; value: string }[];
    createdAt?: string;
}

export interface OrderItem {
    product: Product;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

export interface ShippingAddress {
    name: string;
    phone: string;
    address: string;
    district: string;
    province: string;
    postalCode: string;
}

export interface Order {
    id: string;
    orderNumber: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
    items: OrderItem[];
    subtotal: number;
    shippingFee: number;
    total: number;
    shippingAddress: ShippingAddress;
    paymentMethod: string;
    paymentStatus: string;
    status: string;
    trackingNumber?: string;
    paymentSlip?: string;
    notes?: string;
    createdAt: string;
}

export interface CreateOrderInput {
    items: {
        product: string;
        quantity: number;
    }[];
    shippingAddress: ShippingAddress;
    paymentMethod: string;
    notes?: string;
}
