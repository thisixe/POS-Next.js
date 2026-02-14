'use client';

import { useEffect, useState } from 'react';

interface ClientDateProps {
  value: string | number | Date;
  locale?: string;
  options?: Intl.DateTimeFormatOptions;
}

export default function ClientDate({ value, locale = 'en-US', options }: ClientDateProps) {
  const [formatted, setFormatted] = useState<string>('');

  useEffect(() => {
    const date = new Date(value);
    const formatted = new Intl.DateTimeFormat(locale, options).format(date);
    setFormatted(formatted);
  }, [value, locale, options]);

  return <span>{formatted}</span>;
}
