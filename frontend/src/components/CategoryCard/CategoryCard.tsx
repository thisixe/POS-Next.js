'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import styles from './CategoryCard.module.css';

interface CategoryCardProps {
    name: string;
    nameEn: string;
    slug: string;
    image?: string;
    productCount?: number;
}

export function CategoryCard({ name, nameEn, slug, image, productCount }: CategoryCardProps) {
    const locale = useLocale();
    const displayName = locale === 'th' ? name : nameEn;

    return (
        <Link href={`/products?category=${slug}`} className={styles.card}>
            <div className={styles.imageWrapper}>
                {image ? (
                    <Image
                        src={image}
                        alt={displayName}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                        className={styles.image}
                    />
                ) : (
                    <div className={styles.placeholder}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                        </svg>
                    </div>
                )}
                <div className={styles.overlay}>
                    <h3 className={styles.name}>{displayName}</h3>
                    {productCount !== undefined && (
                        <span className={styles.count}>
                            {productCount} {locale === 'th' ? 'รายการ' : 'items'}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
