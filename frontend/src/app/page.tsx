'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Navbar, Footer, ProductCard, CategoryCard } from '@/components';
import { useQuery } from '@apollo/client/react';
import { GET_HOME_DATA } from '@/graphql/products';
import styles from './page.module.css';
import { Product, Category } from '@/types';

export default function HomePage() {
  const t = useTranslations('home');
  const { data, loading } = useQuery<{ categories: Category[], products: { products: Product[] } }>(GET_HOME_DATA);

  const categories = data?.categories || [];
  const products = data?.products?.products || [];

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              {t('hero.title')}
              <span className={styles.heroHighlight}>{t('hero.subtitle')}</span>
            </h1>
            <p className={styles.heroDescription}>{t('hero.description')}</p>
            <Link href="/products" className={styles.heroCta}>
              {t('hero.cta')}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.heroShape}></div>
            <div className={styles.heroIcon}>💻</div>
          </div>
        </section>

        {/* Categories Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('categories')}</h2>
            <Link href="/products" className={styles.viewAll}>
              {t('viewAll')}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>
          <div className={styles.categoryGrid}>
            {loading ? (
              <div className={styles.loading}>Loading categories...</div>
            ) : categories.length > 0 ? (
              categories.map((category: Category) => (
                <CategoryCard key={category.id} {...category} />
              ))
            ) : (
              <div className={styles.empty}>No categories found</div>
            )}
          </div>
        </section>

        {/* Featured Products Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('featured')}</h2>
            <Link href="/products?featured=true" className={styles.viewAll}>
              {t('viewAll')}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>
          <div className={styles.productGrid}>
            {loading ? (
              <div className={styles.loading}>Loading products...</div>
            ) : products.length > 0 ? (
              products.map((product: Product) => (
                <ProductCard
                  key={product.id}
                  {...product}
                  image={product.images?.[0] || ''}
                />
              ))
            ) : (
              <div className={styles.empty}>No products found</div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.features}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🚚</div>
            <h3 className={styles.featureTitle}>จัดส่งฟรี</h3>
            <p className={styles.featureDesc}>ฟรีค่าจัดส่งเมื่อซื้อ 1,000 บาทขึ้นไป</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>💳</div>
            <h3 className={styles.featureTitle}>ชำระเงินปลอดภัย</h3>
            <p className={styles.featureDesc}>รองรับ PromptPay, บัตรเครดิต</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🛡️</div>
            <h3 className={styles.featureTitle}>รับประกันสินค้า</h3>
            <p className={styles.featureDesc}>สินค้าทุกชิ้นมีการรับประกัน</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>💬</div>
            <h3 className={styles.featureTitle}>บริการหลังการขาย</h3>
            <p className={styles.featureDesc}>ทีมงานพร้อมให้บริการ</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
