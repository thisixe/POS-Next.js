'use client';

import Image from 'next/image';
import { useLocale } from 'next-intl';
import { useCartStore, type CartItem as CartItemType } from '@/lib';
import styles from './CartItem.module.css';

interface CartItemProps {
    item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
    const locale = useLocale();
    const { updateQuantity, removeItem } = useCartStore();

    const displayName = locale === 'th' ? item.name : item.nameEn;
    const price = item.discountPrice || item.price;
    const total = price * item.quantity;

    const formatPrice = (value: number) => {
        return new Intl.NumberFormat('th-TH').format(value);
    };

    return (
        <div className={styles.item}>
            <div className={styles.imageWrapper}>
                {item.image ? (
                    <Image
                        src={item.image}
                        alt={displayName}
                        fill
                        sizes="80px"
                        className={styles.image}
                    />
                ) : (
                    <div className={styles.placeholder}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                    </div>
                )}
            </div>

            <div className={styles.info}>
                <h4 className={styles.name}>{displayName}</h4>
                <p className={styles.price}>฿{formatPrice(price)}</p>
            </div>

            <div className={styles.actions}>
                <div className={styles.quantity}>
                    <button
                        className={styles.qtyBtn}
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label="Decrease quantity"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </button>
                    <span className={styles.qtyValue}>{item.quantity}</span>
                    <button
                        className={styles.qtyBtn}
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        aria-label="Increase quantity"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </button>
                </div>

                <p className={styles.total}>฿{formatPrice(total)}</p>

                <button
                    className={styles.removeBtn}
                    onClick={() => removeItem(item.id)}
                    aria-label="Remove item"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
