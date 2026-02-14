'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@apollo/client/react';
import { useTranslations, useLocale } from 'next-intl';
import { GET_PRODUCT } from '@/graphql/products';
import { Navbar, Footer } from '@/components';
import { useCartStore } from '@/lib';
import styles from './page.module.css';
import { Product } from '@/types';

export default function ProductDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const t = useTranslations('products');
    const commonT = useTranslations('common');
    const locale = useLocale();
    const addItem = useCartStore((state) => state.addItem);

    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(0);

    const { data, loading, error } = useQuery<{ product: Product }>(GET_PRODUCT, {
        variables: { slug },
        skip: !slug,
    });

    if (loading) return (
        <>
            <Navbar />
            <div className={styles.loading}>{commonT('loading')}</div>
            <Footer />
        </>
    );

    if (error) return (
        <>
            <Navbar />
            <div className={styles.error}>{commonT('error')}: {error.message}</div>
            <Footer />
        </>
    );

    const product = data?.product;

    if (!product) return (
        <>
            <Navbar />
            <div className={styles.notFound}>
                <h2>{t('noProducts')}</h2>
                <Link href="/products" style={{ color: '#0ea5e9', marginTop: '1rem', display: 'block' }}>
                    {locale === 'th' ? 'กลับไปยังหน้าสินค้า' : 'Back to Products'}
                </Link>
            </div>
            <Footer />
        </>
    );

    const displayName = locale === 'th' ? product.name : product.nameEn;
    const displayDescription = locale === 'th' ? product.description : product.descriptionEn;
    const finalPrice = product.discountPrice || product.price;
    const hasDiscount = product.discountPrice && product.discountPrice < product.price;
    const discountPercent = hasDiscount && product.price
        ? Math.round(((product.price - (product.discountPrice || 0)) / product.price) * 100)
        : 0;

    const handleAddToCart = () => {
        addItem({
            id: product.id,
            name: product.name,
            nameEn: product.nameEn,
            price: product.price,
            discountPrice: product.discountPrice || undefined,
            image: product.images?.[0] || '',
            stock: product.stock,
        }, quantity);
        alert(locale === 'th' ? 'เพิ่มสินค้าลงตะกร้าแล้ว' : 'Product added to cart');
    };

    const formatPrice = (value: number) => {
        return new Intl.NumberFormat('th-TH').format(value);
    };

    return (
        <div className={styles.page}>
            <Navbar />

            <main className={styles.container}>
                {/* Breadcrumbs */}
                <nav className={styles.breadcrumb}>
                    <Link href="/">{locale === 'th' ? 'หน้าแรก' : 'Home'}</Link>
                    <span className={styles.separator}>/</span>
                    <Link href="/products">{t('title')}</Link>
                    <span className={styles.separator}>/</span>
                    <span>{displayName}</span>
                </nav>

                <div className={styles.productContent}>
                    {/* Left: Gallery */}
                    <div className={styles.gallery}>
                        <div className={styles.mainImageWrapper}>
                            {product.images && product.images.length > 0 ? (
                                <Image
                                    src={product.images[activeImage]}
                                    alt={displayName}
                                    fill
                                    priority
                                    className={styles.mainImage}
                                />
                            ) : (
                                <div className={styles.placeholder}>
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                        <polyline points="21 15 16 10 5 21" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        {product.images && product.images.length > 1 && (
                            <div className={styles.thumbnails}>
                                {product.images.map((img: string, index: number) => (
                                    <div
                                        key={index}
                                        className={`${styles.thumbnail} ${activeImage === index ? styles.active : ''}`}
                                        onClick={() => setActiveImage(index)}
                                    >
                                        <Image src={img} alt={`${displayName} ${index + 1}`} fill />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Info */}
                    <div className={styles.info}>
                        <span className={styles.brand}>{product.brand}</span>
                        <h1 className={styles.name}>{displayName}</h1>

                        <div className={styles.prices}>
                            <span className={styles.price}>฿{formatPrice(finalPrice)}</span>
                            {hasDiscount && (
                                <>
                                    <span className={styles.originalPrice}>฿{formatPrice(product.price)}</span>
                                    <span className={styles.discountBadge}>-{discountPercent}%</span>
                                </>
                            )}
                        </div>

                        <div className={styles.description}>
                            {displayDescription}
                        </div>

                        <div className={styles.actions}>
                            <div className={styles.quantitySelector}>
                                <button
                                    className={styles.qtyBtn}
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                </button>
                                <input
                                    type="number"
                                    className={styles.qtyInput}
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                />
                                <button
                                    className={styles.qtyBtn}
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                </button>
                            </div>

                            <button
                                className={styles.addBtn}
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="9" cy="21" r="1" />
                                    <circle cx="20" cy="21" r="1" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                </svg>
                                {t('addToCart')}
                            </button>
                        </div>

                        <div className={styles.meta}>
                            <div className={styles.metaItem}>
                                {locale === 'th' ? 'สถานะ: ' : 'Status: '}
                                <span className={`${styles.stock} ${product.stock > 10 ? styles.inStock : product.stock > 0 ? styles.lowStock : styles.outOfStock}`}>
                                    {product.stock > 0
                                        ? (locale === 'th' ? `มีสินค้า (${product.stock} ชิ้น)` : `In Stock (${product.stock} items)`)
                                        : t('outOfStock')
                                    }
                                </span>
                            </div>
                            <div className={styles.metaItem}>
                                {locale === 'th' ? 'หมวดหมู่: ' : 'Category: '}
                                <span className={styles.metaValue}>{locale === 'th' ? product.category?.name : product.category?.nameEn}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Specifications */}
                {product.specifications && product.specifications.length > 0 && (
                    <section className={styles.specsSection}>
                        <h2 className={styles.sectionTitle}>{t('specifications')}</h2>
                        <div className={styles.specsGrid}>
                            {product.specifications.map((spec: { key: string; value: string }, index: number) => (
                                <div key={index} className={styles.specItem}>
                                    <span className={styles.specKey}>{spec.key}</span>
                                    <span className={styles.specValue}>{spec.value}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <Footer />
        </div>
    );
}
