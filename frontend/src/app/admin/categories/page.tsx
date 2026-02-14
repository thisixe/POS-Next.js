'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import styles from '../products/products.module.css'; // Reuse product management styles

const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      nameEn
      slug
      productCount
    }
  }
`;

const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CategoryInput!) {
    createCategory(input: $input) {
      id
      name
    }
  }
`;

const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`;

export default function AdminCategoriesPage() {
    const { data, loading, error, refetch } = useQuery<{ categories: Category[] }>(GET_CATEGORIES);
    const [createCategory, { loading: creating }] = useMutation(CREATE_CATEGORY, {
        onCompleted: () => {
            refetch();
            setNewCategory({ name: '', nameEn: '', slug: '' });
            setIsAdding(false);
        }
    });
    const [deleteCategory] = useMutation(DELETE_CATEGORY, {
        onCompleted: () => refetch()
    });

    const [isAdding, setIsAdding] = useState(false);
    const [newCategory, setNewCategory] = useState({
        name: '',
        nameEn: '',
        slug: ''
    });

    if (loading) return <div className={styles.container}>Loading categories...</div>;
    if (error) return <div className={styles.container}>Error: {error.message}</div>;

    const categories = data?.categories || [];

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createCategory({ variables: { input: newCategory } });
        } catch (err) {
            const error = err as Error;
            alert(error.message || 'Error creating category');
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete category "${name}"?`)) {
            try {
                await deleteCategory({ variables: { id } });
            } catch (err) {
                const error = err as Error;
                alert(error.message || 'Error deleting category');
            }
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Categories</h1>
                <button onClick={() => setIsAdding(!isAdding)} className={styles.addBtn}>
                    {isAdding ? 'Cancel' : '+ Add Category'}
                </button>
            </header>

            {isAdding && (
                <div className={styles.formCard} style={{ marginBottom: '2rem' }}>
                    <h2 className={styles.formSectionTitle}>Add New Category</h2>
                    <form onSubmit={handleAdd} className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Name (Thai)</label>
                            <input
                                className={styles.input}
                                value={newCategory.name}
                                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                                required
                            />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Name (English)</label>
                            <input
                                className={styles.input}
                                value={newCategory.nameEn}
                                onChange={(e) => setNewCategory(prev => ({ ...prev, nameEn: e.target.value }))}
                                required
                            />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Slug</label>
                            <input
                                className={styles.input}
                                value={newCategory.slug}
                                onChange={(e) => setNewCategory(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/ /g, '-') }))}
                                required
                            />
                        </div>
                        <div style={{ alignSelf: 'flex-end', marginBottom: '1.5rem' }}>
                            <button type="submit" className={styles.saveBtn} disabled={creating}>
                                {creating ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className={styles.card}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Category Name</th>
                            <th>Slug</th>
                            <th>Products</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((cat: Category & { productCount?: number }) => (
                            <tr key={cat.id}>
                                <td>
                                    <span className={styles.productName}>{cat.name}</span>
                                    <span className={styles.categoryLabel}>{cat.nameEn}</span>
                                </td>
                                <td>{cat.slug}</td>
                                <td>{cat.productCount || 0} Products</td>
                                <td>
                                    <div className={styles.actions}>
                                        <button
                                            onClick={() => handleDelete(cat.id, cat.name)}
                                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
