'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, FormEvent } from 'react';
import { Navbar, Footer } from '@/components';
import { useAuthStore } from '@/lib';
import { useMutation } from '@apollo/client/react';
import { LOGIN_MUTATION } from '@/graphql/auth';
import styles from './page.module.css';
import { User } from '@/types';

export default function LoginPage() {
    const t = useTranslations('auth');
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';
    const { login } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [loginMutation] = useMutation<{ login: { token: string; user: User } }>(LOGIN_MUTATION);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await loginMutation({
                variables: { email, password },
            });

            if (data?.login) {
                const { token, user } = data.login;
                login(token, user);
                router.push(redirect);
            }
        } catch (err) {
            const error = err as Error;
            console.error('Login error:', error);
            setError(error.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <Navbar />

            <main className={styles.main}>
                <div className={styles.card}>
                    <h1 className={styles.title}>{t('login')}</h1>

                    {error && <div className={styles.error}>{error}</div>}

                    <form onSubmit={handleSubmit} className={styles.form}>
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
                            />
                        </div>

                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? '...' : t('login')}
                        </button>
                    </form>

                    <p className={styles.footer}>
                        {t('noAccount')}{' '}
                        <Link href="/register" className={styles.link}>
                            {t('register')}
                        </Link>
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
