'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Navbar, Footer, CartItem } from '@/components';
import { useCartStore, useAuthStore } from '@/lib';
import styles from './page.module.css';

export default function CartPage() {
    const t = useTranslations('cart');
    const { items, subtotal, clearCart } = useCartStore();
    const { isAuthenticated } = useAuthStore();

    const shippingFee = subtotal() >= 1000 ? 0 : 50;
    const total = subtotal() + shippingFee;

    const formatPrice = (value: number) => {
        return new Intl.NumberFormat('th-TH').format(value);
    };

    return (
        <div className={styles.page}>
            <Navbar />

            <main className={styles.main}>
                <h1 className={styles.title}>{t('title')}</h1>

                {items.length === 0 ? (
                    <div className={styles.empty}>
                        <div className={styles.emptyIcon}>🛒</div>
                        <p className={styles.emptyText}>{t('empty')}</p>
                        <Link href="/products" className={styles.continueShopping}>
                            {t('continueShopping')}
                        </Link>
                    </div>
                ) : (
                    <div className={styles.content}>
                        {/* Cart Items */}
                        <div className={styles.items}>
                            {items.map((item) => (
                                <CartItem key={item.id} item={item} />
                            ))}
                            <button className={styles.clearBtn} onClick={clearCart}>
                                ล้างตะกร้า / Clear Cart
                            </button>
                        </div>

                        {/* Order Summary */}
                        <div className={styles.summary}>
                            <h2 className={styles.summaryTitle}>สรุปคำสั่งซื้อ</h2>

                            <div className={styles.summaryRow}>
                                <span>{t('subtotal')}</span>
                                <span>฿{formatPrice(subtotal())}</span>
                            </div>

                            <div className={styles.summaryRow}>
                                <span>{t('shipping')}</span>
                                <span>{shippingFee === 0 ? t('freeShipping') : `฿${formatPrice(shippingFee)}`}</span>
                            </div>

                            {subtotal() < 1000 && (
                                <p className={styles.freeShippingNote}>
                                    ซื้อเพิ่มอีก ฿{formatPrice(1000 - subtotal())} รับส่งฟรี!
                                </p>
                            )}

                            <div className={styles.summaryTotal}>
                                <span>{t('total')}</span>
                                <span className={styles.totalAmount}>฿{formatPrice(total)}</span>
                            </div>

                            {isAuthenticated ? (
                                <Link href="/checkout" className={styles.checkoutBtn}>
                                    {t('checkout')}
                                </Link>
                            ) : (
                                <Link href="/login?redirect=/checkout" className={styles.checkoutBtn}>
                                    {t('loginToCheckout')}
                                </Link>
                            )}

                            <Link href="/products" className={styles.continueLink}>
                                {t('continueShopping')}
                            </Link>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
