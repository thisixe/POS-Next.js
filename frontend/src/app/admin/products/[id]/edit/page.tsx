'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import styles from '../../products.module.css';
import Link from 'next/link';
import { Product, Category } from '@/types';

const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
    }
  }
`;

const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $input: ProductInput!) {
    updateProduct(id: $id, input: $input) {
      id
      name
    }
  }
`;

export default function EditProductPage() {
    const router = useRouter();
    const { id } = useParams();

    // We need to fetch the product data by ID, but GET_PRODUCT uses slug.
    // However, the admin resolver usually supports ID or slug.
    // Let's check backend/src/graphql/resolvers.ts to see what product(id) does.
    // For now, I'll use a specific query for admin by ID if needed, 
    // but looking at common patterns it might be better to define one.

    const { data: productData, loading: productLoading } = useQuery<{ product: Product }>(gql`
    query GetProductById($id: ID!) {
      product(id: $id) {
        id
        name
        nameEn
        slug
        brand
        price
        discountPrice
        stock
        description
        descriptionEn
        featured
        images
        category {
          id
        }
      }
    }
  `, { variables: { id } });

    const { data: catData } = useQuery<{ categories: Category[] }>(GET_CATEGORIES);
    const [updateProduct, { loading: updating }] = useMutation(UPDATE_PRODUCT);
    const [loadedProductId, setLoadedProductId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        nameEn: '',
        slug: '',
        brand: '',
        price: 0,
        discountPrice: 0,
        category: '',
        stock: 0,
        description: '',
        descriptionEn: '',
        featured: false,
        images: [] as string[]
    });

    if (productData?.product && productData.product.id !== loadedProductId) {
        const p = productData.product;
        setFormData({
            name: p.name,
            nameEn: p.nameEn,
            slug: p.slug,
            brand: p.brand,
            price: p.price,
            discountPrice: p.discountPrice || 0,
            category: p.category?.id || '',
            stock: p.stock,
            description: p.description,
            descriptionEn: p.descriptionEn,
            featured: p.featured,
            images: p.images || []
        });
        setLoadedProductId(p.id);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
                type === 'number' ? parseFloat(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { ...input } = formData;
            await updateProduct({
                variables: { id, input }
            });
            router.push('/admin/products');
        } catch (err) {
            const error = err as Error;
            alert(error.message || 'Error updating product');
        }
    };

    if (productLoading) return <div className={styles.container}>Loading product...</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Edit Product</h1>
            </header>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formCard}>
                    <h2 className={styles.formSectionTitle}>General Information</h2>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Product Name (Thai)</label>
                        <input
                            name="name"
                            type="text"
                            className={styles.input}
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Product Name (English)</label>
                        <input
                            name="nameEn"
                            type="text"
                            className={styles.input}
                            value={formData.nameEn}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Slug</label>
                        <input
                            name="slug"
                            type="text"
                            className={styles.input}
                            value={formData.slug}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Brand</label>
                            <input
                                name="brand"
                                type="text"
                                className={styles.input}
                                value={formData.brand}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Category</label>
                            <select
                                name="category"
                                className={styles.select}
                                value={formData.category}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Category</option>
                                {catData?.categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Description (Thai)</label>
                        <textarea
                            name="description"
                            className={styles.textarea}
                            value={formData.description}
                            onChange={handleChange}
                            required
                        ></textarea>
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Description (English)</label>
                        <textarea
                            name="descriptionEn"
                            className={styles.textarea}
                            value={formData.descriptionEn}
                            onChange={handleChange}
                            required
                        ></textarea>
                    </div>
                </div>

                <aside>
                    <div className={styles.formCard} style={{ marginBottom: '1.5rem' }}>
                        <h2 className={styles.formSectionTitle}>Pricing & Inventory</h2>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Price (฿)</label>
                            <input
                                name="price"
                                type="number"
                                className={styles.input}
                                value={formData.price}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Discount Price</label>
                            <input
                                name="discountPrice"
                                type="number"
                                className={styles.input}
                                value={formData.discountPrice}
                                onChange={handleChange}
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Stock Quantity</label>
                            <input
                                name="stock"
                                type="number"
                                className={styles.input}
                                value={formData.stock}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className={styles.fieldGroup} style={{ marginTop: '2rem' }}>
                            <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    name="featured"
                                    type="checkbox"
                                    checked={formData.featured}
                                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                                />
                                Featured Product
                            </label>
                        </div>
                    </div>

                    <div className={styles.formCard}>
                        <h2 className={styles.formSectionTitle}>Images</h2>
                        <textarea
                            className={styles.textarea}
                            style={{ minHeight: '100px' }}
                            value={formData.images.join(', ')}
                            onChange={(e) => setFormData(prev => ({ ...prev, images: e.target.value.split(',').map(s => s.trim()).filter(s => s) }))}
                        ></textarea>
                    </div>

                    <div className={styles.submitBar}>
                        <Link href="/admin/products" className={styles.cancelBtn}>Cancel</Link>
                        <button type="submit" className={styles.saveBtn} disabled={updating}>
                            {updating ? 'Updating...' : 'Update Product'}
                        </button>
                    </div>
                </aside>
            </form>
        </div>
    );
}
