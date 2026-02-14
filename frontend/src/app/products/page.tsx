'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client/react';
import { GET_PRODUCTS, GET_HOME_DATA } from '@/graphql/products';
import { Navbar, Footer, ProductCard } from '@/components';
import styles from './page.module.css';
import { Product, Category } from '@/types';

export default function ProductsPage() {
    const t = useTranslations('products');
    const commonT = useTranslations('common');
    const locale = useLocale();
    const searchParams = useSearchParams();
    const router = useRouter();

    const categoryParam = searchParams.get('category') || 'all';
    const searchQuery = searchParams.get('search') || '';

    // Fetch categories for the filter bar
    const { data: homeData } = useQuery<{ categories: Category[] }>(GET_HOME_DATA);
    const categories = [
        { id: 'all', slug: 'all', name: 'ทั้งหมด', nameEn: 'All' },
        ...(homeData?.categories || [])
    ];

    // Fetch products based on filters
    const { data, loading, error } = useQuery<{ products: { products: Product[], total: number } }>(GET_PRODUCTS, {
        variables: {
            category: categoryParam === 'all' ? undefined : categoryParam,
            search: searchQuery || undefined,
            limit: 20
        }
    });

    const products = data?.products?.products || [];

    const handleCategoryChange = (slug: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (slug === 'all') {
            params.delete('category');
        } else {
            params.set('category', slug);
        }
        router.push(`/products?${params.toString()}`);
    };

    return (
        <div className={styles.page}>
            <Navbar />

            <main className={styles.main}>
                <div className={styles.header}>
                    <h1 className={styles.title}>{t('title')}</h1>
                    {searchQuery && (
                        <p className={styles.subtitle}>
                            {locale === 'th' ? `ผลการค้นหาสำหรับ "${searchQuery}"` : `Search results for "${searchQuery}"`}
                        </p>
                    )}
                    <p className={styles.count}>
                        {loading ? '...' : products.length} {locale === 'th' ? 'รายการ' : 'items'}
                    </p>

                    <div className={styles.filters}>
                        <div className={styles.categoryFilter}>
                            {categories.map((cat: Category | { id: string, slug: string, name: string, nameEn: string }) => (
                                <button
                                    key={cat.id}
                                    className={`${styles.categoryBtn} ${categoryParam === cat.slug ? styles.active : ''}`}
                                    onClick={() => handleCategoryChange(cat.slug)}
                                >
                                    {locale === 'th' ? cat.name : cat.nameEn}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className={styles.loading}>
                        <p>{commonT('loading')}</p>
                    </div>
                ) : error ? (
                    <div className={styles.error}>
                        <p>Error: {error.message}</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className={styles.empty}>
                        <p>{t('noProducts')}</p>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {products.map((product: Product) => (
                            <ProductCard
                                key={product.id}
                                {...product}
                                image={product.images?.[0] || ''}
                            />
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
