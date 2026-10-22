/**
 * Shared motion constants. Every motion component imports from here so the site
 * moves with one voice: a reformer carriage returning on its springs. Moves
 * decelerate and settle with a slight overshoot; nothing bounces twice.
 */

/** The signature curve: fast out, slight overshoot, settle. CSS: `var(--ease-carriage)`. */
export const EASE_CARRIAGE = [0.34, 1.32, 0.5, 1] as const;
/** Calm deceleration with no overshoot (text, fades). CSS: `var(--ease-settle)`. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const EASE_EXPO = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

export const DURATION = {
	fast: 0.3,
	base: 0.6,
	slow: 0.95,
	drive: 1.2,
	intro: 1.4,
} as const;

/** Default viewport config for whileInView reveals: play once, slightly before fully in view. */
export const VIEWPORT_ONCE = { once: true, margin: '0px 0px -12% 0px' } as const;

/** Spring for sliding highlights, sheets and the carriage rail: one small overshoot. */
export const SPRING_CARRIAGE = { type: 'spring', stiffness: 240, damping: 22, mass: 0.9 } as const;

/** Softer spring with no visible overshoot (drawers, cards). */
export const SPRING_SOFT = { type: 'spring', stiffness: 260, damping: 30, mass: 0.9 } as const;
