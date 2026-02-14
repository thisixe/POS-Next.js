'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useQuery } from '@apollo/client/react';
import { GET_ORDER } from '@/graphql/orders';
import { Navbar, Footer } from '@/components';
import styles from './page.module.css';

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('id');
    const t = useTranslations('checkout');
    const locale = useLocale();

    const { data, loading } = useQuery(GET_ORDER, {
        variables: { id: orderId },
        skip: !orderId
    });

    if (loading) return <div className={styles.loading}>กำลังโหลดรายละเอียด...</div>;

    const order = data?.order;

    return (
        <div className={styles.content}>
            <div className={styles.successIcon}>✅</div>
            <h1 className={styles.title}>{t('orderSuccess')}</h1>

            {order ? (
                <div className={styles.orderDetails}>
                    <p className={styles.orderNumber}>
                        {locale === 'th' ? 'หมายเลขคำสั่งซื้อ: ' : 'Order Number: '}
                        <strong>{order.orderNumber}</strong>
                    </p>
                    <p className={styles.orderTotal}>
                        {locale === 'th' ? 'ยอดรวมทั้งสิ้น: ' : 'Total Amount: '}
                        <strong>฿{new Intl.NumberFormat('th-TH').format(order.total)}</strong>
                    </p>
                    <div className={styles.statusBox}>
                        {locale === 'th'
                            ? 'เราจะเร่งดำเนินการจัดส่งสินค้าให้คุณโดยเร็วที่สุด ขอบคุณที่วางใจใช้บริการครับ'
                            : 'We will process and ship your order as soon as possible. Thank you for choosing us!'}
                    </div>
                </div>
            ) : (
                <p>ไม่พบข้อมูลคำสั่งซื้อ / Order data not found</p>
            )}

            <div className={styles.actions}>
                <Link href="/products" className={styles.primaryBtn}>
                    {locale === 'th' ? 'เลือกซื้อสินค้าต่อ' : 'Continue Shopping'}
                </Link>
                <Link href="/orders" className={styles.secondaryBtn}>
                    {locale === 'th' ? 'ดูสถานะคำสั่งซื้อ' : 'View My Orders'}
                </Link>
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <div className={styles.page}>
            <Navbar />
            <main className={styles.container}>
                <Suspense fallback={<div>Loading...</div>}>
                    <SuccessContent />
                </Suspense>
            </main>
            <Footer />
        </div>
    );
}
