'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { siteConfig } from '@/lib/site-config';

const TIMEZONE_COOKIE = '@opencals/timezone';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

interface TimezoneContextValue {
	timezone: string;
	setTimezone: (timezone: string) => void;
}

const TimezoneContext = createContext<TimezoneContextValue | undefined>(undefined);

export function TimezoneProvider({ children }: { children: ReactNode }) {
	// Tensile is one city: every time renders in the studio's zone (Europe/Berlin), on the server
	// and in the browser, so SSR and hydration always agree and a visitor abroad sees studio time.
	const [timezone, setTimezone] = useState<string>(siteConfig.timezone);

	useEffect(() => {
		if (typeof document === 'undefined') return;

		const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
		const secureSuffix = isSecure ? '; secure' : '';

		if (timezone) {
			document.cookie = `${TIMEZONE_COOKIE}=${encodeURIComponent(timezone)}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax${secureSuffix}`;
		}
	}, [timezone]);

	const value = useMemo<TimezoneContextValue>(() => ({ timezone, setTimezone }), [timezone]);

	return <TimezoneContext.Provider value={value}>{children}</TimezoneContext.Provider>;
}

export function useTimezone(): TimezoneContextValue {
	const ctx = useContext(TimezoneContext);
	if (!ctx) {
		throw new Error('useTimezone must be used within TimezoneProvider');
	}
	return ctx;
}
