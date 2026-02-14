'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import { Navbar, Footer } from '@/components';
import { useAuthStore } from '@/lib';
import { useMutation } from '@apollo/client/react';
import { REGISTER_MUTATION } from '@/graphql/auth';
import styles from '../login/page.module.css';
import { User } from '@/types';

export default function RegisterPage() {
    const t = useTranslations('auth');
    const router = useRouter();
    const { login } = useAuthStore();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [registerMutation] = useMutation<{ register: { token: string; user: User } }>(REGISTER_MUTATION);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('รหัสผ่านไม่ตรงกัน / Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร / Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const { data } = await registerMutation({
                variables: { email, password, name },
            });

            if (data?.register) {
                const { token, user } = data.register;
                login(token, user);
                router.push('/');
            }
        } catch (err) {
            const error = err as Error;
            console.error('Registration error:', error);
            setError(error.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <Navbar />

            <main className={styles.main}>
                <div className={styles.card}>
                    <h1 className={styles.title}>{t('register')}</h1>

                    {error && <div className={styles.error}>{error}</div>}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.field}>
                            <label className={styles.label}>{t('name')}</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="ชื่อของคุณ"
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>{t('email')}</label>
                            <input
                                type="email"
                                className={styles.input}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="example@email.com"
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>{t('password')}</label>
                            <input
                                type="password"
                                className={styles.input}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>{t('confirmPassword')}</label>
                            <input
                                type="password"
                                className={styles.input}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? '...' : t('register')}
                        </button>
                    </form>

                    <p className={styles.footer}>
                        {t('hasAccount')}{' '}
                        <Link href="/login" className={styles.link}>
                            {t('login')}
                        </Link>
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
