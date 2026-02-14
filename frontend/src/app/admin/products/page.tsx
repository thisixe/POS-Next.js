'use client';

import Link from 'next/link';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_PRODUCTS } from '@/graphql/products';
import { gql } from '@apollo/client';
import styles from './products.module.css';
import { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/types';

const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;

export default function AdminProductsPage() {
    const [search, setSearch] = useState('');
    const { data, loading, error, refetch } = useQuery<{ products: { products: Product[], total: number } }>(GET_PRODUCTS, {
        variables: { limit: 50 }
    });

    const [deleteProduct] = useMutation(DELETE_PRODUCT, {
        onCompleted: () => refetch()
    });

    if (loading) return <div className={styles.container}>Loading products...</div>;
    if (error) return <div className={styles.container}>Error: {error.message}</div>;

    const products = data?.products?.products || [];

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
            try {
                await deleteProduct({ variables: { id } });
            } catch {
                alert('Error deleting product');
            }
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Products</h1>
                <Link href="/admin/products/add" className={styles.addBtn}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Product
                </Link>
            </header>

            <div className={styles.card}>
                <div className={styles.filters}>
                    <input
                        type="text"
                        placeholder="Search products..."
                        className={styles.searchInput}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length > 0 ? (
                            products.map((product) => (
                                <tr key={product.id}>
                                    <td>
                                        <div className={styles.productInfo}>
                                            <div style={{ position: 'relative', width: '40px', height: '40px', flexShrink: 0 }}>
                                                <Image
                                                    src={product.images?.[0] || '/placeholder.png'}
                                                    alt={product.name}
                                                    fill
                                                    className={styles.productImage}
                                                    style={{ objectFit: 'cover', borderRadius: '4px' }}
                                                />
                                            </div>
                                            <div>
                                                <span className={styles.productName}>{product.name}</span>
                                                <span className={styles.categoryLabel}>{product.brand}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{product.category?.name || '-'}</td>
                                    <td>฿{new Intl.NumberFormat('th-TH').format(product.price)}</td>
                                    <td>
                                        <span className={`${styles.stockBadge} ${product.stock > 10 ? styles.inStock :
                                            product.stock > 0 ? styles.lowStock :
                                                styles.outOfStock
                                            }`}>
                                            {product.stock} in stock
                                        </span>
                                    </td>
                                    <td>
                                        {product.featured ? (
                                            <span className={styles.statusBadge} style={{ color: '#0ea5e9', fontWeight: 600 }}>Featured</span>
                                        ) : '-'}
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <Link href={`/admin/products/${product.id}/edit`} className={`${styles.actionBtn} ${styles.editBtn}`} title="Edit">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                </svg>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(product.id, product.name)}
                                                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                                title="Delete"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>No products found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
