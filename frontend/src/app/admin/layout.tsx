'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib';
import { useEffect, useState } from 'react';
import styles from './layout.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout, isAuthenticated } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Simple protection: if not authenticated or not admin, redirect
        // (Actual server-side protection should be in middleware)
        if (mounted && (!isAuthenticated || user?.role !== 'admin')) {
            // Allow a small delay for state hydration
            const timer = setTimeout(() => {
                if (!isAuthenticated || user?.role !== 'admin') {
                    router.push('/login?redirect=/admin');
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isAuthenticated, user, router, mounted]);

    if (!mounted) return null;

    const navItems = [
        {
            name: 'Dashboard', href: '/admin', icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                </svg>
            )
        },
        {
            name: 'Products', href: '/admin/products', icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 8l-2-2H5L3 8m18 0l-2 10H5L3 8m18 0h-3M3 8h3m3 0h6" />
                    <circle cx="12" cy="13" r="3" />
                </svg>
            )
        },
        {
            name: 'Categories', href: '/admin/categories', icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 6h16M4 12h16M4 18h7" />
                </svg>
            )
        },
        {
            name: 'Orders', href: '/admin/orders', icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
            )
        },
    ];

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <div className={styles.adminLayout}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <Link href="/" className={styles.logo}>
                        <span>FullOption.IT</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#64748b' }}>Admin</span>
                    </Link>
                </div>

                <nav className={styles.nav}>
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navLink} ${pathname === item.href ? styles.activeLink : ''}`}
                        >
                            {item.icon}
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className={styles.sidebarFooter}>
                    <button onClick={handleLogout} className={styles.logoutBtn}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Logout
                    </button>
                </div>
            </aside>

            <main className={styles.mainContent}>
                <header className={styles.topBar}>
                    <div className={styles.userProfile}>
                        <div className={styles.avatar}>
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div className={styles.userName}>
                            {user?.name || 'Admin'}
                        </div>
                    </div>
                </header>

                {children}
            </main>
        </div>
    );
}
