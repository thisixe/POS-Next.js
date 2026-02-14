import { getRequestConfig } from 'next-intl/server';

export const locales = ['th', 'en'] as const;
export const defaultLocale = 'th' as const;

export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale;

    // Validate that the locale is supported
    if (!locale || !locales.includes(locale as Locale)) {
        locale = defaultLocale;
    }

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default,
    };
});
