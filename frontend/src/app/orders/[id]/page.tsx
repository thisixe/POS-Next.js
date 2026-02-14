'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_ORDER } from '@/graphql/orders';
import { Navbar, Footer } from '@/components';
import { useAuthStore } from '@/lib';
import styles from './page.module.css';
import { Order, OrderItem } from '@/types';
import { gql } from '@apollo/client';
import { uploadImage } from '@/lib/upload';
import { useState } from 'react';
import ClientDate from '@/components/ClientDate/ClientDate';

const UPLOAD_PAYMENT_SLIP = gql`
  mutation UploadPaymentSlip($id: ID!, $slipUrl: String!) {
    uploadPaymentSlip(id: $id, slipUrl: $slipUrl) {
      id
      paymentSlip
      status
    }
  }
`;

export default function OrderDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const t = useTranslations('order');
    const checkoutT = useTranslations('checkout');
    const commonT = useTranslations('common');
    const locale = useLocale();
    const { isAuthenticated } = useAuthStore();

    const [uploadingFile, setUploadingFile] = useState(false);

    const { data, loading, error, refetch } = useQuery<{ order: Order }>(GET_ORDER, {
        variables: { id },
        skip: !id || !isAuthenticated
    });

    const [uploadPaymentSlip, { loading: mutationLoading }] = useMutation(UPLOAD_PAYMENT_SLIP, {
        onCompleted: () => refetch()
    });

    if (!isAuthenticated) return null;

    const handleUpload = async (file: File) => {
        try {
            setUploadingFile(true);
            const url = await uploadImage(file);
            await uploadPaymentSlip({ variables: { id, slipUrl: url } });
            alert(locale === 'th' ? 'อัปโหลดสลิปสำเร็จ' : 'Payment slip uploaded successfully');
        } catch (err: unknown) {
            const error = err as Error;
            alert(error.message || 'Upload failed');
        } finally {
            setUploadingFile(false);
        }
    };

    const formatPrice = (value: number) => {
        return new Intl.NumberFormat('th-TH').format(value);
    };

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

    const order = data?.order;

    if (!order) return (
        <>
            <Navbar />
            <div className={styles.notFound}>
                {locale === 'th' ? 'ไม่พบคำสั่งซื้อ' : 'Order not found'}
                <Link href="/orders" style={{ color: '#0ea5e9', marginTop: '1rem' }}>
                    {locale === 'th' ? 'กลับไปที่รายการสั่งซื้อ' : 'Back to My Orders'}
                </Link>
            </div>
            <Footer />
        </>
    );

    const isUploading = uploadingFile || mutationLoading;

    return (
        <div className={styles.page}>
            <Navbar />

            <main className={styles.container}>
                <header className={styles.header}>
                    <Link href="/orders" className={styles.backBtn}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                        </svg>
                        {locale === 'th' ? 'กลับไปที่รายการสั่งซื้อ' : 'Back to My Orders'}
                    </Link>
                    <div className={styles.titleWrapper}>
                        <h1 className={styles.orderId}>Order #{order.orderNumber}</h1>
                        <span className={`${styles.statusBadge} ${styles[order.status]}`}>
                            {t(`status.${order.status}`)}
                        </span>
                    </div>
                    <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
                        {locale === 'th' ? 'สั่งซื้อเมื่อ: ' : 'Placed on: '} 
                        <ClientDate value={order.createdAt} locale={locale === 'th' ? 'th-TH' : 'en-US'} options={{
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        }} />
                    </p>
                </header>

                <div className={styles.contentGrid}>
                    <div className={styles.main}>
                        {/* Order Items */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>{locale === 'th' ? 'รายการสินค้า' : 'Order Items'}</h2>
                            <div className={styles.itemList}>
                                {order.items.map((item: OrderItem, idx: number) => (
                                    <div key={idx} className={styles.orderItem}>
                                        <div className={styles.itemImage}>
                                            {item.image && (
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    style={{ objectFit: 'contain', padding: '4px' }}
                                                />
                                            )}
                                        </div>
                                        <div className={styles.itemInfo}>
                                            <Link href={`/products/${item.product?.slug || '#'}`} className={styles.itemName}>
                                                {item.name}
                                            </Link>
                                            <span className={styles.itemQtyPrice}>
                                                {item.quantity} x ฿{formatPrice(item.price)}
                                            </span>
                                        </div>
                                        <div style={{ fontWeight: 600, color: '#0f172a' }}>
                                            ฿{formatPrice(item.price * item.quantity)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.summaryRows}>
                                <div className={styles.summaryRow}>
                                    <span>ยอดรวมสินค้า</span>
                                    <span>฿{formatPrice(order.subtotal)}</span>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span>ค่าจัดส่ง</span>
                                    <span>{order.shippingFee === 0 ? 'ฟรี / Free' : `฿${formatPrice(order.shippingFee)}`}</span>
                                </div>
                                <div className={styles.summaryTotal}>
                                    <span>ยอดชำระสุทธิ</span>
                                    <span>฿{formatPrice(order.total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Slip Upload Section */}
                        {order.paymentMethod === 'bank_transfer' && order.paymentStatus !== 'completed' && (
                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>{locale === 'th' ? 'แจ้งโอนเงิน' : 'Payment Confirmation'}</h2>
                                <div className={styles.paymentInstructions}>
                                    <div className={styles.bankInfo}>
                                        <p><strong>ธนาคารกสิกรไทย (K-Bank)</strong></p>
                                        <p>ชื่อบัญชี: บจก. คิดให้หน่อย (KHN Co., Ltd.)</p>
                                        <p>เลขที่บัญชี: 123-4-56789-0</p>
                                    </div>

                                    {order.paymentSlip ? (
                                        <div className={styles.slipPreview}>
                                            <p style={{ marginBottom: '0.5rem', color: '#059669' }}>
                                                {locale === 'th' ? '✓ อัปโหลดสลิปแล้ว กำลังรอการตรวจสอบ' : '✓ Slip uploaded, awaiting verification'}
                                            </p>
                                            <div style={{ position: 'relative', width: '200px', height: '300px', backgroundColor: '#f8fafc', borderRadius: '8px', overflow: 'hidden' }}>
                                                <Image src={order.paymentSlip} alt="Payment Slip" fill style={{ objectFit: 'contain' }} />
                                            </div>
                                            <button
                                                className={styles.reUploadBtn}
                                                onClick={() => {
                                                    const input = document.createElement('input');
                                                    input.type = 'file';
                                                    input.accept = 'image/*';
                                                    input.onchange = async (e) => {
                                                        const target = e.target as HTMLInputElement;
                                                        const file = target.files?.[0];
                                                        if (file) handleUpload(file);
                                                    };
                                                    input.click();
                                                }}
                                                disabled={isUploading}
                                            >
                                                {locale === 'th' ? 'อัปโหลดใหม่' : 'Re-upload'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className={styles.uploadBox}>
                                            <p style={{ marginBottom: '1rem', color: '#64748b' }}>{locale === 'th' ? 'กรุณาอัปโหลดรูปภาพสลิปการโอนเงินเพื่อยืนยัน' : 'Please upload your transfer slip to confirm payment'}</p>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleUpload(file);
                                                }}
                                                id="slip-upload"
                                                style={{ display: 'none' }}
                                            />
                                            <label htmlFor="slip-upload" className={styles.uploadBtn}>
                                                {isUploading ? commonT('loading') : (locale === 'th' ? 'เลือกรูปภาพสลิป' : 'Select Slip Image')}
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <aside className={styles.sidebar}>
                        {/* Shipping Address */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>{checkoutT('shipping')}</h2>
                            <div className={styles.addressBox}>
                                <span className={styles.addressName}>{order.shippingAddress.name}</span>
                                <p>{order.shippingAddress.phone}</p>
                                <p>{order.shippingAddress.address}</p>
                                <p>{order.shippingAddress.district}, {order.shippingAddress.province}</p>
                                <p>{order.shippingAddress.postalCode}</p>
                            </div>
                        </div>

                        {/* Order Info */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>{locale === 'th' ? 'ข้อมูลการชำระเงิน' : 'Payment Info'}</h2>
                            <div className={styles.infoList}>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>{checkoutT('payment')}</span>
                                    <span className={styles.infoValue}>{checkoutT(`paymentMethods.${order.paymentMethod}`)}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>{locale === 'th' ? 'สถานะการชำระเงิน' : 'Payment Status'}</span>
                                    <span className={styles.infoValue} style={{ color: order.paymentStatus === 'completed' ? '#10b981' : '#f59e0b' }}>
                                        {order.paymentStatus === 'completed'
                                            ? (locale === 'th' ? 'ชำระเงินแล้ว' : 'Paid')
                                            : (locale === 'th' ? 'รอการชำระเงิน' : 'Pending Payment')}
                                    </span>
                                </div>
                                {order.trackingNumber && (
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>{locale === 'th' ? 'หมายเลขพัสดุ' : 'Tracking Number'}</span>
                                        <span className={styles.trackingNumber}>{order.trackingNumber}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {order.notes && (
                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>{locale === 'th' ? 'หมายเหตุ' : 'Notes'}</h2>
                                <p style={{ fontSize: '0.875rem', color: '#475569', fontStyle: 'italic' }}>&quot;{order.notes}&quot;</p>
                            </div>
                        )}
                    </aside>
                </div>
            </main>

            <Footer />
        </div>
    );
}
