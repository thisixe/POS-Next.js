'use client';

import Link from 'next/link';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import styles from './page.module.css';
import { Order, Product } from '@/types';

const GET_ADMIN_DASHBOARD = gql`
  query GetAdminDashboard {
    adminDashboard {
      totalProducts
      totalOrders
      totalRevenue
      pendingOrders
      recentOrders {
        id
        orderNumber
        total
        status
        createdAt
        user {
          name
        }
      }
      monthlyRevenue {
        month
        revenue
      }
      lowStockProducts {
        id
        name
        stock
        price
      }
    }
  }
`;

export default function AdminDashboardPage() {
    const { data, loading, error } = useQuery<{
        adminDashboard: {
            totalProducts: number;
            totalOrders: number;
            totalRevenue: number;
            pendingOrders: number;
            recentOrders: Order[];
            monthlyRevenue: { month: string, revenue: number }[];
            lowStockProducts: Product[];
        }
    }>(GET_ADMIN_DASHBOARD);

    if (loading) return <div className={styles.container}>Loading dashboard...</div>;
    if (error) return <div className={styles.container}>Error: {error.message}</div>;

    const stats = data?.adminDashboard || {
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        recentOrders: [],
        monthlyRevenue: [],
        lowStockProducts: []
    };

    const statCards = [
        {
            label: 'Total Revenue',
            value: `฿${new Intl.NumberFormat('th-TH').format(stats.totalRevenue)}`,
            icon: '💰'
        },
        {
            label: 'Products',
            value: stats.totalProducts,
            icon: '📦'
        },
        {
            label: 'Total Orders',
            value: stats.totalOrders,
            icon: '🛒'
        },
        {
            label: 'Pending Orders',
            value: stats.pendingOrders,
            icon: '⏳'
        },
    ];

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Dashboard</h1>
                <p className={styles.subtitle}>Welcome back to your administration panel.</p>
            </header>

            <div className={styles.statsGrid}>
                {statCards.map((card, index) => (
                    <div key={index} className={styles.statCard}>
                        <div className={styles.statIcon}>{card.icon}</div>
                        <div className={styles.statInfo}>
                            <span className={styles.statLabel}>{card.label}</span>
                            <span className={styles.statValue}>{card.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.recentGrid}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Recent Orders</h2>
                        <Link href="/admin/orders" className={styles.viewAll}>View All</Link>
                    </div>
                    <div className={styles.cardContent}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Customer</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentOrders.length > 0 ? (
                                    stats.recentOrders.map((order) => (
                                        <tr key={order.id}>
                                            <td>{order.orderNumber}</td>
                                            <td>{order.user?.name || 'Guest'}</td>
                                            <td>฿{new Intl.NumberFormat('th-TH').format(order.total)}</td>
                                            <td>
                                                <span className={`${styles.status} ${styles[order.status?.toLowerCase()] || ''}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td><ClientDate value={order.createdAt} locale={locale === 'th' ? 'th-TH' : 'en-US'} options={{ year: 'numeric', month: '2-digit', day: '2-digit' }} /></td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No recent orders</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Stock Alerts & Revenue</h2>
                    </div>
                    <div className={styles.cardContent} style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f43f5e', marginBottom: '1rem' }}>⚠️ Low Stock Products</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {stats.lowStockProducts.length > 0 ? (
                                stats.lowStockProducts.map(product => (
                                    <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.5rem', backgroundColor: '#fff1f2', borderRadius: '0.375rem' }}>
                                        <span>{product.name}</span>
                                        <span style={{ fontWeight: 700, color: '#e11d48' }}>Stock: {product.stock}</span>
                                    </div>
                                ))
                            ) : (
                                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>All products are well stocked.</p>
                            )}
                        </div>

                        <div style={{ marginTop: '2rem' }}>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>📈 Revenue Trend (Last 6 Months)</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {stats.monthlyRevenue.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ width: '60px', fontSize: '0.75rem', color: '#64748b' }}>{item.month}</span>
                                        <div style={{ flex: 1, height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{
                                                width: `${Math.min(100, (item.revenue / Math.max(1, ...stats.monthlyRevenue.map(m => m.revenue))) * 100)}%`,
                                                height: '100%',
                                                backgroundColor: '#0ea5e9'
                                            }}></div>
                                        </div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>฿{new Intl.NumberFormat('th-TH').format(item.revenue)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <Link href="/admin/products/add" className={styles.actionBtn} style={{
                                display: 'block',
                                padding: '0.75rem',
                                backgroundColor: '#0ea5e9',
                                color: 'white',
                                borderRadius: '0.5rem',
                                textAlign: 'center',
                                textDecoration: 'none',
                                fontWeight: 500
                            }}>
                                + Add New Product
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
