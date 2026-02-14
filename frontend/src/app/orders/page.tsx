'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { useQuery } from '@apollo/client/react';
import { GET_MY_ORDERS } from '@/graphql/orders';
import { Navbar, Footer } from '@/components';
import { useAuthStore } from '@/lib';
import styles from './page.module.css';
import { Order, OrderItem } from '@/types';
import ClientDate from '@/components/ClientDate/ClientDate';

export default function MyOrdersPage() {
    const router = useRouter();
    const t = useTranslations('order');
    const commonT = useTranslations('common');
    const locale = useLocale();
    const { isAuthenticated } = useAuthStore();

    const { data, loading, error } = useQuery<{ myOrders: Order[] }>(GET_MY_ORDERS, {
        fetchPolicy: 'network-only',
        skip: !isAuthenticated
    });

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login?redirect=/orders');
        }
    }, [isAuthenticated, router]);

    const formatPrice = (value: number) => {
        return new Intl.NumberFormat('th-TH').format(value);
    };

    if (!isAuthenticated) return null;

    return (
        <div className={styles.page}>
            <Navbar />

            <main className={styles.container}>
                <h1 className={styles.title}>
                    {locale === 'th' ? 'คำสั่งซื้อของฉัน' : 'My Orders'}
                </h1>

                {loading ? (
                    <div className={styles.loading}>{commonT('loading')}</div>
                ) : error ? (
                    <div className={styles.error}>{commonT('error')}: {error.message}</div>
                ) : !data?.myOrders || data.myOrders.length === 0 ? (
                    <div className={styles.empty}>
                        <div className={styles.emptyIcon}>📦</div>
                        <p className={styles.emptyText}>
                            {locale === 'th' ? 'ยังไม่มีรายการสั่งซื้อ' : 'No orders found'}
                        </p>
                        <Link href="/products" className={styles.shopBtn}>
                            {locale === 'th' ? 'ดูสินค้าเพื่อสั่งซื้อ' : 'Browse Products'}
                        </Link>
                    </div>
                ) : (
                    <div className={styles.orderList}>
                        {data?.myOrders.map((order: Order) => (
                            <Link
                                href={`/orders/${order.id}`}
                                key={order.id}
                                className={styles.orderCard}
                            >
                                <div className={styles.cardHeader}>
                                    <div className={styles.headerLeft}>
                                        <span className={styles.orderNumber}>#{order.orderNumber}</span>
                                        <span className={styles.orderDate}><ClientDate value={order.createdAt} locale={locale === 'th' ? 'th-TH' : 'en-US'} options={{
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        }} /></span>
                                    </div>
                                    <span className={`${styles.statusBadge} ${styles[order.status]}`}>
                                        {t(`status.${order.status}`)}
                                    </span>
                                </div>
                                <div className={styles.cardBody}>
                                    <div className={styles.itemPreview}>
                                        {order.items.slice(0, 3).map((item: OrderItem, idx: number) => (
                                            <div key={idx} className={styles.previewImage}>
                                                {item.image && (
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        fill
                                                        style={{ objectFit: 'contain', padding: '4px' }}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                        {order.items.length > 3 && (
                                            <div className={styles.previewMore}>
                                                +{order.items.length - 3}
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.cardRight}>
                                        <span className={styles.totalLabel}>
                                            {locale === 'th' ? 'รวมสุทธิ' : 'Total'}
                                        </span>
                                        <span className={styles.totalAmount}>฿{formatPrice(order.total)}</span>
                                        <span className={styles.viewBtn}>
                                            {locale === 'th' ? 'ดูรายละเอียด' : 'View Details'}
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="9 18 15 12 9 6" />
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
