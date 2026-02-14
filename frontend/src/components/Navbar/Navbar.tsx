'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCartStore, useAuthStore } from '@/lib';
import styles from './Navbar.module.css';

export function Navbar() {
    const t = useTranslations('nav');
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const cartItems = useCartStore((state) => state.totalItems());
    const { isAuthenticated, user, logout, isAdmin } = useAuthStore();

    const switchLocale = () => {
        const newLocale = locale === 'th' ? 'en' : 'th';
        const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
        router.push(newPath || `/${newLocale}`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
            setIsSearchOpen(false);
            setSearchQuery('');
        }
    };

    return (
        <header className={styles.header}>
            <nav className={styles.nav}>
                <div className={styles.container}>
                    {/* Logo */}
                    <Link href="/" className={styles.logo}>
                        <span className={styles.logoIcon}>💻</span>
                        <span className={styles.logoText}>FullOption.IT</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className={styles.desktopNav}>
                        <Link href="/" className={styles.navLink}>{t('home')}</Link>
                        <Link href="/products" className={styles.navLink}>{t('products')}</Link>
                    </div>

                    {/* Actions */}
                    <div className={styles.actions}>
                        {/* Search Toggle */}
                        <button
                            className={styles.iconBtn}
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            aria-label="Search"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.3-4.3" />
                            </svg>
                        </button>

                        {/* Language Switcher */}
                        <button className={styles.langBtn} onClick={switchLocale}>
                            {locale === 'th' ? 'EN' : 'TH'}
                        </button>

                        {/* Cart */}
                        <Link href="/cart" className={styles.cartBtn}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="9" cy="21" r="1" />
                                <circle cx="20" cy="21" r="1" />
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                            </svg>
                            {cartItems > 0 && <span className={styles.cartBadge}>{cartItems}</span>}
                        </Link>

                        {/* User Menu */}
                        {isAuthenticated ? (
                            <div className={styles.userMenu}>
                                <button className={styles.userBtn}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                    <span className={styles.userName}>{user?.name}</span>
                                </button>
                                <div className={styles.dropdown}>
                                    <Link href="/orders" className={styles.dropdownItem}>{t('myOrders')}</Link>
                                    {isAdmin() && (
                                        <Link href="/admin" className={styles.dropdownItem}>{t('admin')}</Link>
                                    )}
                                    <button onClick={logout} className={styles.dropdownItem}>
                                        {t('logout')}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link href="/login" className={styles.loginBtn}>
                                {t('login')}
                            </Link>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            className={styles.menuToggle}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Menu"
                        >
                            <span className={`${styles.hamburger} ${isMenuOpen ? styles.open : ''}`}></span>
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                {isSearchOpen && (
                    <div className={styles.searchBar}>
                        <form onSubmit={handleSearch} className={styles.searchForm}>
                            <input
                                type="text"
                                placeholder={locale === 'th' ? 'ค้นหาสินค้า...' : 'Search products...'}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={styles.searchInput}
                                autoFocus
                            />
                            <button type="submit" className={styles.searchSubmit}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.3-4.3" />
                                </svg>
                            </button>
                        </form>
                    </div>
                )}

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className={styles.mobileNav}>
                        <Link href="/" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>
                            {t('home')}
                        </Link>
                        <Link href="/products" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>
                            {t('products')}
                        </Link>
                        {!isAuthenticated && (
                            <>
                                <Link href="/login" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>
                                    {t('login')}
                                </Link>
                                <Link href="/register" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>
                                    {t('register')}
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </nav>
        </header>
    );
}
