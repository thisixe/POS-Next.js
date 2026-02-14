'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import styles from './Footer.module.css';

export function Footer() {
    const t = useTranslations();

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.grid}>
                    {/* Brand */}
                    <div className={styles.brand}>
                        <Link href="/" className={styles.logo}>
                            <span className={styles.logoIcon}>💻</span>
                            <span className={styles.logoText}>FullOption.IT</span>
                        </Link>
                        <p className={styles.tagline}>{t('site.tagline')}</p>
                        <div className={styles.social}>
                            <a href="#" className={styles.socialLink} aria-label="Facebook">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </a>
                            <a href="#" className={styles.socialLink} aria-label="Line">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.064-.022.134-.033.199-.033.213 0 .392.09.512.25l2.438 3.317V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className={styles.links}>
                        <h4 className={styles.linksTitle}>Quick Links</h4>
                        <Link href="/" className={styles.link}>{t('nav.home')}</Link>
                        <Link href="/products" className={styles.link}>{t('nav.products')}</Link>
                        <Link href="/cart" className={styles.link}>{t('nav.cart')}</Link>
                    </div>

                    {/* Categories */}
                    <div className={styles.links}>
                        <h4 className={styles.linksTitle}>Categories</h4>
                        <Link href="/products?category=laptop" className={styles.link}>Laptop</Link>
                        <Link href="/products?category=desktop" className={styles.link}>Desktop PC</Link>
                        <Link href="/products?category=components" className={styles.link}>Components</Link>
                        <Link href="/products?category=accessories" className={styles.link}>Accessories</Link>
                    </div>

                    {/* Contact */}
                    <div className={styles.links}>
                        <h4 className={styles.linksTitle}>Contact</h4>
                        <p className={styles.contactItem}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
                            </svg>
                            contact@fulloption.it
                        </p>
                        <p className={styles.contactItem}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                            02-XXX-XXXX
                        </p>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p className={styles.copyright}>
                        © {new Date().getFullYear()} FullOption.IT. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
