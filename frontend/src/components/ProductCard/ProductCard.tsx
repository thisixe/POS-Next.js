'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useCartStore } from '@/lib';
import styles from './ProductCard.module.css';

interface ProductCardProps {
    id: string;
    name: string;
    nameEn: string;
    slug: string;
    price: number;
    discountPrice?: number;
    image: string;
    stock: number;
    featured?: boolean;
}

export function ProductCard({
    id,
    name,
    nameEn,
    slug,
    price,
    discountPrice,
    image,
    stock,
    featured = false,
}: ProductCardProps) {
    const t = useTranslations('products');
    const locale = useLocale();
    const addItem = useCartStore((state) => state.addItem);

    const displayName = locale === 'th' ? name : nameEn;
    const finalPrice = discountPrice || price;
    const hasDiscount = discountPrice && discountPrice < price;
    const discountPercent = hasDiscount
        ? Math.round(((price - discountPrice) / price) * 100)
        : 0;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (stock > 0) {
            addItem({
                id,
                name,
                nameEn,
                price,
                discountPrice,
                image,
                stock,
            });
        }
    };

    const formatPrice = (value: number) => {
        return new Intl.NumberFormat('th-TH').format(value);
    };

    return (
        <Link href={`/products/${slug}`} className={styles.card}>
            <div className={styles.imageWrapper}>
                {image ? (
                    <Image
                        src={image}
                        alt={displayName}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className={styles.image}
                    />
                ) : (
                    <div className={styles.placeholder}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                    </div>
                )}

                {hasDiscount && (
                    <span className={styles.discountBadge}>-{discountPercent}%</span>
                )}

                {featured && (
                    <span className={styles.featuredBadge}>Featured</span>
                )}

                {stock === 0 && (
                    <div className={styles.outOfStock}>
                        <span>{t('outOfStock')}</span>
                    </div>
                )}
            </div>

            <div className={styles.content}>
                <h3 className={styles.name}>{displayName}</h3>

                <div className={styles.priceRow}>
                    <div className={styles.prices}>
                        <span className={styles.price}>฿{formatPrice(finalPrice)}</span>
                        {hasDiscount && (
                            <span className={styles.originalPrice}>฿{formatPrice(price)}</span>
                        )}
                    </div>

                    <button
                        className={styles.addBtn}
                        onClick={handleAddToCart}
                        disabled={stock === 0}
                        aria-label={t('addToCart')}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                    </button>
                </div>
            </div>
        </Link>
    );
}
