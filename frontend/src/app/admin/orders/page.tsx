'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import styles from '../products/products.module.css'; // Reuse table styles
import { Order } from '@/types';
import { useState } from 'react';
import Image from 'next/image';

const GET_ADMIN_ORDERS = gql`
  query GetAdminOrders($status: String) {
    adminOrders(status: $status, limit: 50) {
      orders {
        id
        orderNumber
        total
        status
        paymentStatus
        paymentMethod
        paymentSlip
        trackingNumber
        createdAt
        user {
          name
          email
        }
      }
      total
    }
  }
`;

const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($id: ID!, $status: String!) {
    updateOrderStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

const UPDATE_PAYMENT_STATUS = gql`
  mutation UpdatePaymentStatus($id: ID!, $status: String!) {
    updatePaymentStatus(id: $id, status: $status) {
      id
      paymentStatus
    }
  }
`;

const UPDATE_TRACKING = gql`
  mutation UpdateTracking($id: ID!, $trackingNumber: String!) {
    updateTrackingNumber(id: $id, trackingNumber: $trackingNumber) {
      id
      trackingNumber
    }
  }
`;

export default function AdminOrdersPage() {
    const [statusFilter, setStatusFilter] = useState<string>('');
    const { data, loading, error, refetch } = useQuery<{ adminOrders: { orders: Order[], total: number } }>(GET_ADMIN_ORDERS, {
        variables: { status: statusFilter || undefined }
    });

    const [updateStatus] = useMutation(UPDATE_ORDER_STATUS, { onCompleted: () => refetch() });
    const [updatePayment] = useMutation(UPDATE_PAYMENT_STATUS, { onCompleted: () => refetch() });
    const [updateTracking] = useMutation(UPDATE_TRACKING, { onCompleted: () => refetch() });

    const [selectedSlip, setSelectedSlip] = useState<string | null>(null);
    const [trackingInput, setTrackingInput] = useState<{ id: string, value: string } | null>(null);

    if (loading) return <div className={styles.container}>Loading orders...</div>;
    if (error) return <div className={styles.container}>Error: {error.message}</div>;

    const orders = data?.adminOrders?.orders || [];

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await updateStatus({ variables: { id, status: newStatus } });
        } catch (err: unknown) {
            const error = err as Error;
            alert(error.message || 'Error updating order');
        }
    };

    const handlePaymentConfirm = async (id: string) => {
        if (confirm('Confirm payment for this order?')) {
            try {
                await updatePayment({ variables: { id, status: 'completed' } });
            } catch (err: unknown) {
                const error = err as Error;
                alert(error.message || 'Error confirming payment');
            }
        }
    };

    const handleTrackingUpdate = async () => {
        if (!trackingInput) return;
        try {
            await updateTracking({ variables: { id: trackingInput.id, trackingNumber: trackingInput.value } });
            setTrackingInput(null);
            alert('Tracking number updated');
        } catch (err: unknown) {
            const error = err as Error;
            alert(error.message || 'Error updating tracking');
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Orders ({data?.adminOrders?.total || 0})</h1>
                <div className={styles.actions}>
                    <select
                        className={styles.select}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ width: '200px' }}
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </header>

            <div className={styles.card}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Order #</th>
                            <th>Customer</th>
                            <th>Total</th>
                            <th>Payment</th>
                            <th>Status</th>
                            <th>Tracking</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length > 0 ? (
                            orders.map((order: Order) => (
                                <tr key={order.id}>
                                    <td><strong>{order.orderNumber}</strong></td>
                                    <td>
                                        <span className={styles.productName}>{order.user?.name}</span>
                                        <span className={styles.categoryLabel}>{order.user?.email}</span>
                                    </td>
                                    <td>฿{new Intl.NumberFormat('th-TH').format(order.total)}</td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span className={`${styles.status} ${order.paymentStatus === 'completed' ? styles.completed : styles.pending}`}>
                                                {order.paymentStatus}
                                            </span>
                                            <span style={{ fontSize: '10px', color: '#64748b' }}>{order.paymentMethod}</span>
                                            {order.paymentSlip && (
                                                <button
                                                    onClick={() => setSelectedSlip(order.paymentSlip!)}
                                                    style={{ fontSize: '11px', color: '#0ea5e9', cursor: 'pointer', background: 'none', border: 'none', textAlign: 'left', padding: 0 }}
                                                >
                                                    View Slip
                                                </button>
                                            )}
                                            {order.paymentStatus !== 'completed' && order.paymentSlip && (
                                                <button
                                                    onClick={() => handlePaymentConfirm(order.id)}
                                                    style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold', cursor: 'pointer', background: 'none', border: 'none', textAlign: 'left', padding: 0 }}
                                                >
                                                    Confirm Payment
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`${styles.status} ${styles[order.status?.toLowerCase()] || ''}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>
                                        {trackingInput?.id === order.id ? (
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <input
                                                    type="text"
                                                    className={styles.input}
                                                    style={{ padding: '2px 4px', fontSize: '12px', width: '100px' }}
                                                    value={trackingInput.value}
                                                    onChange={(e) => setTrackingInput({ ...trackingInput, value: e.target.value })}
                                                />
                                                <button onClick={handleTrackingUpdate} style={{ fontSize: '12px' }}>Save</button>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>{order.trackingNumber || '-'}</span>
                                                <button
                                                    onClick={() => setTrackingInput({ id: order.id, value: order.trackingNumber || '' })}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                                                >
                                                    ✎
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                    <td><ClientDate value={order.createdAt} locale={locale === 'th' ? 'th-TH' : 'en-US'} options={{ year: 'numeric', month: '2-digit', day: '2-digit' }} /></td>
                                    <td>
                                        <select
                                            className={styles.select}
                                            style={{ padding: '0.25rem 0.5rem', width: 'auto', fontSize: '12px' }}
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="processing">Processing</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem' }}>No orders found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Slip Preview Modal */}
            {selectedSlip && (
                <div
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
                    onClick={() => setSelectedSlip(null)}
                >
                    <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
                        <button
                            style={{ position: 'absolute', top: '-40px', right: 0, color: 'white', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
                            onClick={() => setSelectedSlip(null)}
                        >
                            ✕
                        </button>
                        <div style={{ position: 'relative', width: '400px', height: '600px' }}>
                            <Image src={selectedSlip} alt="Payment Slip" fill style={{ objectFit: 'contain' }} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
