'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { useMutation } from '@apollo/client/react';
import { CREATE_ORDER } from '@/graphql/orders';
import { Navbar, Footer } from '@/components';
import { useCartStore, useAuthStore } from '@/lib';
import styles from './page.module.css';
import { CreateOrderInput } from '@/types';

export default function CheckoutPage() {
    const router = useRouter();
    const t = useTranslations('checkout');
    const addrT = useTranslations('address');
    const locale = useLocale();

    const { items, subtotal, clearCart } = useCartStore();
    const { isAuthenticated, user } = useAuthStore();

    const [form, setForm] = useState({
        name: user?.name || '',
        phone: '',
        address: '',
        district: '',
        province: '',
        postalCode: '',
        notes: ''
    });

    const [paymentMethod, setPaymentMethod] = useState('promptpay');

    const shippingFee = subtotal() >= 1000 ? 0 : 50;
    const total = subtotal() + shippingFee;

    const [createOrder, { loading }] = useMutation<{ createOrder: { id: string } }, { input: CreateOrderInput }>(CREATE_ORDER, {
        onCompleted: (data) => {
            clearCart();
            router.push(`/checkout/success?id=${data.createOrder.id}`);
        },
        onError: (error) => {
            alert(error.message);
        }
    });

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login?redirect=/checkout');
        }
        if (items.length === 0) {
            router.push('/cart');
        }
    }, [isAuthenticated, items, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const input: CreateOrderInput = {
            items: items.map(item => ({
                product: item.id,
                quantity: item.quantity
            })),
            shippingAddress: {
                name: form.name,
                phone: form.phone,
                address: form.address,
                district: form.district,
                province: form.province,
                postalCode: form.postalCode
            },
            paymentMethod,
            notes: form.notes
        };

        try {
            await createOrder({ variables: { input } });
        } catch {
            alert('Error creating order');
        }
    };

    const formatPrice = (value: number) => {
        return new Intl.NumberFormat('th-TH').format(value);
    };

    if (!isAuthenticated || items.length === 0) return null;

    return (
        <div className={styles.page}>
            <Navbar />

            <main className={styles.container}>
                <h1 className={styles.title}>{t('title')}</h1>

                <form onSubmit={handleSubmit} className={styles.content}>
                    <div className={styles.main}>
                        {/* Shipping Address */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                {t('shipping')}
                            </h2>

                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{addrT('name')}</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className={styles.input}
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{addrT('phone')}</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        className={styles.input}
                                        value={form.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                                    <label className={styles.label}>{addrT('address')}</label>
                                    <textarea
                                        name="address"
                                        className={styles.input}
                                        rows={3}
                                        value={form.address}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{addrT('district')}</label>
                                    <input
                                        type="text"
                                        name="district"
                                        className={styles.input}
                                        value={form.district}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{addrT('province')}</label>
                                    <input
                                        type="text"
                                        name="province"
                                        className={styles.input}
                                        value={form.province}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{addrT('postalCode')}</label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        className={styles.input}
                                        value={form.postalCode}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
                                    <line x1="2" y1="10" x2="22" y2="10" />
                                </svg>
                                {t('payment')}
                            </h2>

                            <div className={styles.paymentMethods}>
                                <div
                                    className={`${styles.paymentOption} ${paymentMethod === 'promptpay' ? styles.active : ''}`}
                                    onClick={() => setPaymentMethod('promptpay')}
                                >
                                    <div className={styles.radio}><div className={styles.radioInner} /></div>
                                    <div className={styles.paymentInfo}>
                                        <span className={styles.paymentName}>{t('paymentMethods.promptpay')}</span>
                                        <span className={styles.paymentDesc}>Scan QR with any bank app</span>
                                    </div>
                                </div>
                                <div
                                    className={`${styles.paymentOption} ${paymentMethod === 'bankTransfer' ? styles.active : ''}`}
                                    onClick={() => setPaymentMethod('bankTransfer')}
                                >
                                    <div className={styles.radio}><div className={styles.radioInner} /></div>
                                    <div className={styles.paymentInfo}>
                                        <span className={styles.paymentName}>{t('paymentMethods.bankTransfer')}</span>
                                        <span className={styles.paymentDesc}>Transfer to our bank account</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                                {locale === 'th' ? 'หมายเหตุถึงร้านค้า' : 'Notes to Shop'}
                            </h2>
                            <textarea
                                name="notes"
                                className={styles.input}
                                rows={2}
                                value={form.notes}
                                onChange={handleChange}
                                placeholder={locale === 'th' ? 'เช่น รายละเอียดที่อยู่เพิ่มเติม' : 'e.g. additional address details'}
                            />
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <aside className={styles.sidebar}>
                        <div className={`${styles.section} ${styles.summary}`}>
                            <h3 className={styles.sectionTitle}>สรุปรายการสั่งซื้อ</h3>

                            <div className={styles.orderItems}>
                                {items.map(item => (
                                    <div key={item.id} className={styles.orderItem}>
                                        <div className={styles.itemImage}>
                                            {item.image && <Image src={item.image} alt={item.name} fill style={{ objectFit: 'contain', padding: '5px' }} />}
                                        </div>
                                        <div className={styles.itemInfo}>
                                            <span className={styles.itemName}>{locale === 'th' ? item.name : item.nameEn}</span>
                                            <span className={styles.itemQtyPrice}>
                                                {item.quantity} x ฿{formatPrice(item.discountPrice || item.price)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.summaryRows}>
                                <div className={styles.summaryRow}>
                                    <span>ยอดรวมสินค้า</span>
                                    <span>฿{formatPrice(subtotal())}</span>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span>ค่าจัดส่ง</span>
                                    <span>{shippingFee === 0 ? 'ฟรี / Free' : `฿${formatPrice(shippingFee)}`}</span>
                                </div>
                                <div className={styles.summaryTotal}>
                                    <span>ยอดชำระสุทธิ</span>
                                    <span>฿{formatPrice(total)}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={loading}
                            >
                                {loading ? 'กำลังดำเนินการ...' : t('placeOrder')}
                            </button>

                            <Link href="/cart" className={styles.backLink}>
                                กลับไปแก้ไขตะกร้า / Back to Cart
                            </Link>
                        </div>
                    </aside>
                </form>
            </main>

            <Footer />
        </div>
    );
}
