'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation, useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import styles from '../products.module.css';
import { Category } from '@/types';

const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
    }
  }
`;

const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: ProductInput!) {
    createProduct(input: $input) {
      id
      name
    }
  }
`;

export default function AddProductPage() {
    const router = useRouter();
    const { data: catData } = useQuery<{ categories: Category[] }>(GET_CATEGORIES);
    const [createProduct, { loading }] = useMutation(CREATE_PRODUCT);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
                type === 'number' ? parseFloat(value) : value
        }));
    };

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
        setFormData(prev => ({ ...prev, slug: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { ...input } = formData;
            if (!input.category) {
                alert('Please select a category');
                return;
            }

            await createProduct({
                variables: { input }
            });
            router.push('/admin/products');
        } catch (err) {
            const error = err as Error;
            console.error(error);
            alert(error.message || 'Error creating product');
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Add New Product</h1>
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
                            placeholder="e.g. แล็ปท็อปประสิทธิภาพสูง"
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
                            placeholder="e.g. High-Performance Laptop"
                            value={formData.nameEn}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Slug (URL Friendly)</label>
                        <input
                            name="slug"
                            type="text"
                            className={styles.input}
                            placeholder="e.g. high-performance-laptop"
                            value={formData.slug}
                            onChange={handleSlugChange}
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
                                placeholder="e.g. ASUS, Apple"
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
                            placeholder="Describe the product..."
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
                            placeholder="Describe the product in English..."
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
                            <label className={styles.label}>Discount Price (Optional)</label>
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
                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1rem' }}>
                            For now, please enter image URLs separated by comma.
                        </p>
                        <textarea
                            className={styles.textarea}
                            style={{ minHeight: '100px' }}
                            placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                            onChange={(e) => setFormData(prev => ({ ...prev, images: e.target.value.split(',').map(s => s.trim()).filter(s => s) }))}
                        ></textarea>
                    </div>

                    <div className={styles.submitBar}>
                        <Link href="/admin/products" className={styles.cancelBtn}>Cancel</Link>
                        <button type="submit" className={styles.saveBtn} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Product'}
                        </button>
                    </div>
                </aside>
            </form>
        </div>
    );
}
