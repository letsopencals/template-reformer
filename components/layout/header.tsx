'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useMotionValueEvent, useScroll, type Transition } from 'framer-motion';
import { clsx } from 'clsx';
import { useSession } from 'next-auth/react';
import { useCart } from '@/contexts/cart-context';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { Logo } from '@/components/layout/logo';
import { NAV_LINKS, isActive } from '@/components/layout/nav-links';
import { EASE_CARRIAGE, EASE_EXPO } from '@/components/motion/easing';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { useSmoothScroll } from '@/components/motion/smooth-scroll';

const BAR_SHOWN = { y: '0%' } as const;
const BAR_HIDDEN = { y: '-100%' } as const;
const BAR_TRANSITION: Transition = { duration: 0.5, ease: EASE_EXPO };
const MENU_OFF = { opacity: 0, y: -12 } as const;
const MENU_ON = { opacity: 1, y: 0 } as const;
const MENU_TRANSITION: Transition = { duration: 0.45, ease: EASE_CARRIAGE };

export interface HeaderStudio {
	key: string;
	name: string;
}

/**
 * Fixed masthead: logo, the six section links, account and the cart ("Beds (n)").
 * Plaster bar with a hairline; hides on scroll down, returns on scroll up.
 * Phones get a full-height menu. The cart opens the drawer.
 */
export function Header({ logo, studios = [] }: { logo?: string | null; studios?: HeaderStudio[] }) {
	const { status, data: session } = useSession();
	const { cart } = useCart();
	const pathname = usePathname();
	const reduce = useReducedMotion();
	const lenis = useSmoothScroll();
	const { scrollY } = useScroll();
	const [hidden, setHidden] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const [cartOpen, setCartOpen] = useState(false);

	const count = cart?.items?.length ?? 0;
	const authenticated = status === 'authenticated';
	const firstName = session?.customer?.firstName ?? null;

	useMotionValueEvent(scrollY, 'change', (y) => {
		const prev = scrollY.getPrevious() ?? 0;
		setScrolled(y > 8);
		if (menuOpen || cartOpen) return;
		if (y > 200 && y > prev + 4) setHidden(true);
		else if (y < prev - 4 || y <= 200) setHidden(false);
	});

	// Close the menu on navigation.
	const [lastPath, setLastPath] = useState(pathname);
	if (pathname !== lastPath) {
		setLastPath(pathname);
		setMenuOpen(false);
	}

	useEffect(() => {
		if (!menuOpen) return;
		lenis?.stop();
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
		window.addEventListener('keydown', onKey);
		return () => {
			lenis?.start();
			document.body.style.overflow = prev;
			window.removeEventListener('keydown', onKey);
		};
	}, [menuOpen, lenis]);

	const openCart = useCallback(() => {
		setMenuOpen(false);
		setCartOpen(true);
	}, []);
	const closeCart = useCallback(() => setCartOpen(false), []);

	return (
		<>
			<motion.header
				className={clsx(
					'fixed inset-x-0 top-0 z-[60] border-b transition-colors duration-300',
					scrolled || menuOpen ? 'border-line bg-plaster/92 backdrop-blur-md' : 'border-transparent bg-plaster/0',
				)}
				initial={false}
				animate={hidden && !reduce ? BAR_HIDDEN : BAR_SHOWN}
				transition={BAR_TRANSITION}
			>
				<div className="container-x flex h-16 items-center gap-6 lg:h-[72px]">
					<Link href="/" aria-label="Tensile, home" className="shrink-0">
						<Logo src={logo} />
					</Link>

					<nav aria-label="Main" className="ml-4 max-lg:hidden">
						<ul className="flex items-center gap-1">
							{NAV_LINKS.map((l) => (
								<li key={l.href}>
									<Link
										href={l.href}
										aria-current={isActive(pathname, l.href) ? 'page' : undefined}
										className={clsx(
											'relative px-3 py-2 text-[0.92rem] font-medium transition-colors',
											isActive(pathname, l.href) ? 'text-ink' : 'text-graphite hover:text-ink',
										)}
									>
										{l.label}
										{isActive(pathname, l.href) ? <span aria-hidden className="absolute inset-x-3 -bottom-px h-px bg-ink" /> : null}
									</Link>
								</li>
							))}
						</ul>
					</nav>

					<div className="ml-auto flex items-center gap-2 sm:gap-3">
						<Link
							href={authenticated ? '/account' : '/login'}
							className="eyebrow px-2 py-2 text-graphite transition-colors hover:text-ink max-sm:hidden"
						>
							{authenticated ? (firstName ? `Hi, ${firstName}` : 'Account') : 'Sign in'}
						</Link>
						<button
							type="button"
							onClick={openCart}
							aria-haspopup="dialog"
							aria-label={`Your beds, ${count} ${count === 1 ? 'class' : 'classes'} held`}
							className={clsx(
								'inline-flex h-9 items-center gap-2 rounded-[2px] border px-3 font-mono text-[0.68rem] uppercase tracking-[0.12em] transition-colors',
								count > 0 ? 'border-ink bg-ink text-paper hover:bg-ink-soft' : 'border-line text-ink hover:border-ink',
							)}
						>
							<span aria-hidden>Beds</span>
							<span aria-hidden className="tabular">
								{String(count).padStart(2, '0')}
							</span>
						</button>
						<button
							type="button"
							onClick={() => setMenuOpen((v) => !v)}
							aria-expanded={menuOpen}
							aria-controls="mobile-menu"
							aria-label={menuOpen ? 'Close menu' : 'Open menu'}
							className="flex h-9 w-9 items-center justify-center rounded-[2px] text-ink lg:hidden"
						>
							<span aria-hidden className="relative block h-3 w-5">
								<span className={clsx('absolute left-0 h-px w-5 bg-ink transition-transform duration-300', menuOpen ? 'top-1.5 rotate-45' : 'top-0')} />
								<span className={clsx('absolute left-0 h-px w-5 bg-ink transition-transform duration-300', menuOpen ? 'top-1.5 -rotate-45' : 'top-3')} />
							</span>
						</button>
					</div>
				</div>

				<AnimatePresence>
					{menuOpen ? (
						<motion.nav
							id="mobile-menu"
							aria-label="Main"
							data-lenis-prevent
							className="h-[calc(100svh-4rem)] overflow-y-auto border-t border-line bg-plaster lg:hidden"
							initial={reduce ? false : MENU_OFF}
							animate={MENU_ON}
							exit={reduce ? undefined : MENU_OFF}
							transition={MENU_TRANSITION}
						>
							<ul className="container-x py-6">
								{NAV_LINKS.map((l, i) => (
									<li key={l.href} className="border-b border-line">
										<Link href={l.href} className="flex items-baseline justify-between py-4">
											<span className="display-sm text-ink">{l.label}</span>
											<span className="tabular text-xs text-steel">{String(i + 1).padStart(2, '0')}</span>
										</Link>
										{l.href === '/studios' && studios.length ? (
											<ul className="-mt-2 flex flex-wrap gap-x-5 gap-y-1 pb-4">
												{studios.map((s) => (
													<li key={s.key}>
														<Link href={`/studios/${s.key}`} className="eyebrow text-graphite hover:text-ink">
															{s.name}
														</Link>
													</li>
												))}
											</ul>
										) : null}
									</li>
								))}
								<li className="pt-6">
									<Link href={authenticated ? '/account' : '/login'} className="eyebrow text-ink">
										{authenticated ? 'Your account' : 'Sign in'}
									</Link>
								</li>
							</ul>
						</motion.nav>
					) : null}
				</AnimatePresence>
			</motion.header>

			<CartDrawer open={cartOpen} onClose={closeCart} />
		</>
	);
}
