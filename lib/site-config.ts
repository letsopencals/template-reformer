/**
 * Tensile: brand copy and studio knowledge for the template.
 *
 * Business data (classes, prices, capacities, instructors, studios, the online
 * class link, logo and banner) loads from the Opencals storefront API. This file
 * holds what the API has no field for: room plans, instructor bios, the spring
 * (intensity) system, the level path and editorial copy. A studio that forks the
 * template rewrites this file and keeps the code.
 *
 * Lookups are keyed by API slugs (location slug, staff slug) or by the class key
 * that `lib/catalog.ts` derives from variant slugs (`flow-mitte-lena` → `flow`).
 * Anything the API returns that has no entry here still renders, with fallbacks.
 *
 * Every number shown on the site (beds left, classes this week, prices) comes
 * from the API. Don't put made-up stats here.
 */

/* ------------------------------------------------------------------ Types */

/** Reformer spring colours, used as the intensity language across the site. */
export type Spring = 'green' | 'yellow' | 'blue' | 'red';

export interface SpringInfo {
	label: string;
	/** One word for chips: "Gentle", "Flowing"... */
	intensity: string;
	meaning: string;
	hex: string;
}

/** A room drawn as an SVG plan: beds in a grid of rows × cols. */
export interface RoomLayout {
	rows: number;
	cols: number;
}

export interface RoomMeta {
	/** Stable key within the studio, e.g. `long-room`. */
	key: string;
	name: string;
	/** Equipment in the room; drives the bed glyph. */
	equipment: 'reformer' | 'tower' | 'mat';
	/** Beds/stations. Equals the class `maxAttendees` in the seed. */
	beds: number;
	layout: RoomLayout;
	/** Private room: one bed is used for a 1:1, two for a duet. */
	private?: boolean;
}

export interface StudioMeta {
	/** Short slug used in variant slugs and URLs: `mitte`. */
	key: string;
	name: string;
	/** "Mitte" */
	short: string;
	address: string;
	neighbourhood: string;
	blurb: string;
	/** How to get there, one line. */
	transit: string;
	rooms: RoomMeta[];
	images: string[];
	online?: boolean;
}

export interface InstructorMeta {
	bio: string;
	/** Longer paragraph for the profile page. */
	story: string;
	languages: string[];
	specialities: string[];
	instagram?: string;
}

export interface ClassMeta {
	/** Short display name ("Flow"). The product title stays the long name. */
	short: string;
	spring: Spring;
	/** Display level, e.g. "Level 1". */
	level: string;
	/** Sort order along the level path (0 = Foundations). */
	levelOrder: number;
	tagline: string;
	whatToBring: string[];
	/** Shown before booking when the class has an entry requirement. */
	prerequisite: string | null;
	/** Room key per studio key, e.g. `{ mitte: 'long-room' }`. */
	rooms: Record<string, string>;
}

export interface WorkshopMeta {
	spring: Spring;
	tagline: string;
	whatToBring: string[];
}

export interface LevelStep {
	key: string;
	label: string;
	/** Class keys that count as this step. */
	classKeys: string[];
	/** Completed classes needed (in `requires.classKeys`) to unlock this step. */
	requires: { classKeys: string[]; count: number } | null;
	description: string;
}

/* ------------------------------------------------------------------ Config */

export const siteConfig = {
	name: 'Tensile',
	tagline: 'Strength, under tension.',
	description:
		'Small-room reformer Pilates in Berlin. Three studios in Mitte, Kreuzberg and Prenzlauer Berg, eight teachers, and every class capped at the number of beds in the room.',
	url: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',
	locale: 'en_GB',
	/** BCP 47 locale for Intl formatting. */
	intlLocale: 'en-GB',
	country: 'DE',
	/** Fallbacks only; the store's settings win when they load. */
	currency: 'EUR',
	/** Every time on the site renders in this zone, on the server and in the browser. */
	timezone: 'Europe/Berlin',

	logo: { text: 'Tensile', descriptor: 'Reformer Pilates · Berlin' },

	contact: {
		email: 'hello@tensile.studio',
		phone: '+49 30 1234 5670',
		hours: 'Studios open Mon–Fri 07:00–21:00, Sat–Sun 09:00–14:00',
		instagram: 'https://instagram.com/tensile.studio',
	},

	/** Collection slugs with a special meaning. */
	collections: {
		/** Classes for newcomers (Foundations, Prenatal). */
		starter: 'start-here',
		reformer: 'reformer',
		tower: 'tower',
		mat: 'mat',
		privates: 'privates',
		workshops: 'workshops',
	},

	/** Location `type` values from the API. */
	locationTypes: {
		online: 'online',
		physical: 'physical',
		delivery: 'delivery',
	},

	policies: {
		/** Free cancel/reschedule up to this many hours before class (product `cancelGap` wins when loaded). */
		cancelHours: 12,
		/** How far ahead classes can be booked. */
		bookingWindowDays: 21,
		/** Hold time on a bed in the cart, for copy only (the cart's `expiresAt` is the truth). */
		holdMinutes: 15,
	},

	/** "3 beds left" turns urgent (spring red) at or below this. */
	lowSeatsThreshold: 2,

	/** Online classes: the Join button opens this many minutes before the start. */
	joinWindowMinutes: 10,

	/** Off-peak window: class START, local time, both ends inclusive (matches the automatic Off-peak discount). */
	offPeak: { weekdays: [1, 2, 3, 4, 5], from: '10:00', to: '16:00', label: 'Off-peak', discountLabel: '20% off midday classes' },

	/** Intro offer copy (the discount itself is automatic, applied at checkout). */
	introOffer: {
		title: 'Intro offer',
		headline: '30% off your first order',
		body: 'New to Tensile? Your first booking is 30% off, applied automatically at checkout. Start with Foundations.',
	},

	/** Appointment `customAttributes` keys the template writes. */
	customAttributeKeys: {
		/** "1" or "2": a duet is one booking for two people. */
		people: 'people',
	},

	springs: {
		green: { label: 'Green spring', intensity: 'Gentle', meaning: 'Gentle and restorative', hex: '#3E9B6A' },
		yellow: { label: 'Yellow spring', intensity: 'Flowing', meaning: 'Flowing, moderate load', hex: '#E2B42E' },
		blue: { label: 'Blue spring', intensity: 'Strong', meaning: 'Strong and challenging', hex: '#2F5BD3' },
		red: { label: 'Red spring', intensity: 'Heavy', meaning: 'Advanced, heavy load', hex: '#D9412B' },
	} satisfies Record<Spring, SpringInfo>,

	/** Studios by location slug. */
	studios: {
		'tensile-mitte': {
			key: 'mitte',
			name: 'Tensile Mitte',
			short: 'Mitte',
			address: 'Torstraße 140, 10119 Berlin',
			neighbourhood: 'Mitte',
			blurb:
				'Our biggest studio, two floors up from Torstraße: the twelve-bed Long Room, the Tower Room, and a private room for 1:1s. North light all day.',
			transit: 'U8 Rosenthaler Platz, 3 min walk',
			rooms: [
				{ key: 'long-room', name: 'Long Room', equipment: 'reformer', beds: 12, layout: { rows: 2, cols: 6 } },
				{ key: 'tower-room', name: 'Tower Room', equipment: 'tower', beds: 6, layout: { rows: 2, cols: 3 } },
				{ key: 'private-room', name: 'Private Room', equipment: 'reformer', beds: 2, layout: { rows: 1, cols: 2 }, private: true },
			],
			images: ['/images/studios/mitte-1.jpg', '/images/studios/mitte-2.jpg'],
		},
		'tensile-kreuzberg': {
			key: 'kreuzberg',
			name: 'Tensile Kreuzberg',
			short: 'Kreuzberg',
			address: 'Paul-Lincke-Ufer 20, 10999 Berlin',
			neighbourhood: 'Kreuzberg',
			blurb:
				'A converted print shop on the Landwehr canal. Ten reformers in the Canal Room, sixteen mats in the loft upstairs, and coffee next door.',
			transit: 'U1/U8 Kottbusser Tor, 6 min walk',
			rooms: [
				{ key: 'canal-room', name: 'Canal Room', equipment: 'reformer', beds: 10, layout: { rows: 2, cols: 5 } },
				{ key: 'mat-loft', name: 'Mat Loft', equipment: 'mat', beds: 16, layout: { rows: 4, cols: 4 } },
				{ key: 'private-room', name: 'Private Room', equipment: 'reformer', beds: 2, layout: { rows: 1, cols: 2 }, private: true },
			],
			images: ['/images/studios/kreuzberg-1.jpg', '/images/studios/kreuzberg-2.jpg'],
		},
		'tensile-prenzlauer-berg': {
			key: 'prenzlauer-berg',
			name: 'Tensile Prenzlauer Berg',
			short: 'Prenzlauer Berg',
			address: 'Kastanienallee 54, 10435 Berlin',
			neighbourhood: 'Prenzlauer Berg',
			blurb:
				'Our smallest room, off a quiet courtyard on Kastanienallee. Eight beds, so every class feels like a semi-private.',
			transit: 'U2 Eberswalder Straße, 5 min walk',
			rooms: [
				{ key: 'courtyard-room', name: 'Courtyard Room', equipment: 'reformer', beds: 8, layout: { rows: 2, cols: 4 } },
				{ key: 'private-room', name: 'Private Room', equipment: 'reformer', beds: 2, layout: { rows: 1, cols: 2 }, private: true },
			],
			images: ['/images/studios/prenzlauer-berg-1.jpg', '/images/studios/prenzlauer-berg-2.jpg'],
		},
		'tensile-at-home': {
			key: 'online',
			name: 'Tensile at Home',
			short: 'Online',
			address: 'Live online',
			neighbourhood: 'Your living room',
			blurb: 'Thirty-minute live mat classes with a real teacher who can see you. All you need is a mat and a bit of floor.',
			transit: 'Join from the link in your account',
			rooms: [],
			images: [],
			online: true,
		},
	} satisfies Record<string, StudioMeta>,

	/** Instructors by staff slug (a leading `staff-` is ignored when matching). */
	instructors: {
		'lena-hoffmann': {
			bio: 'Head of teaching; former contemporary dancer, 12 years on the reformer.',
			story:
				'Lena danced with companies in Leipzig and Rotterdam before an ankle sent her to the reformer. She builds the teaching syllabus at Tensile and still teaches the early Tower class twice a week.',
			languages: ['DE', 'EN'],
			specialities: ['Tower', 'Sculpt', 'Flow'],
			instagram: 'https://instagram.com/tensile.studio',
		},
		'jonas-weber': {
			bio: 'Ex-rower who came for his back and stayed for the springs.',
			story: 'Jonas rowed for a Berlin club for a decade. His classes are fast, loud and very precise about hips.',
			languages: ['DE', 'EN'],
			specialities: ['Jump Board', 'Sculpt'],
		},
		'amara-okafor': {
			bio: 'Pre/postnatal specialist; teaches like she’s talking you through it over coffee.',
			story: 'Amara trained in London as a pre and postnatal specialist. Her Prenatal classes fill with second-timers.',
			languages: ['EN'],
			specialities: ['Flow', 'Foundations', 'Prenatal'],
		},
		'sofia-marchetti': {
			bio: 'Physio background; obsessed with clean alignment cues.',
			story: 'Sofia worked as a physiotherapist in Bologna before moving to Berlin. Expect hands-on cues and very few wasted reps.',
			languages: ['EN', 'IT'],
			specialities: ['Foundations', 'Flow', 'Prenatal'],
		},
		'mika-tanaka': {
			bio: 'Mat and props nerd; runs Tensile at Home.',
			story: 'Mika runs the Mat Loft and the live online classes. If there is a ball, a ring or a band, Mika has a use for it.',
			languages: ['EN'],
			specialities: ['Mat & Props', 'Live Online Mat', 'Flow', 'Foundations'],
		},
		'clara-becker': {
			bio: 'Runs the Courtyard Room; precise, quiet, relentless.',
			story: 'Clara teaches most of the classes in Prenzlauer Berg. She rarely raises her voice and you will still shake.',
			languages: ['DE', 'EN'],
			specialities: ['Sculpt', 'Flow', 'Foundations'],
		},
		'noah-schmidt': {
			bio: 'Track athlete turned teacher; the Jump Board playlist is his.',
			story: 'Noah ran the 400 m for a Berlin athletics club. He brought the jump board to Tensile and the playlists with it.',
			languages: ['DE', 'EN'],
			specialities: ['Jump Board', 'Sculpt'],
		},
		'elif-yilmaz': {
			bio: 'Classical Pilates certified; the Tower Room is her favourite place in Berlin.',
			story: 'Elif trained in the classical method in New York. She teaches Tower, Flow and the Tuesday online mat class.',
			languages: ['DE', 'EN', 'TR'],
			specialities: ['Tower', 'Flow', 'Foundations', 'Live Online Mat'],
		},
	} satisfies Record<string, InstructorMeta>,

	/** Class types by class key (the prefix of every variant slug). */
	classes: {
		foundations: {
			short: 'Foundations',
			spring: 'green',
			level: 'Foundations',
			levelOrder: 0,
			tagline: 'Start here. The reformer, the springs and the five things every class builds on.',
			whatToBring: ['Grip socks (or buy a pair at the desk)', 'Water', 'Arrive 10 minutes early for a set-up'],
			prerequisite: null,
			rooms: { mitte: 'long-room', kreuzberg: 'canal-room', 'prenzlauer-berg': 'courtyard-room' },
		},
		flow: {
			short: 'Flow',
			spring: 'yellow',
			level: 'Level 1',
			levelOrder: 1,
			tagline: 'Full-body reformer at a steady pace. The class most people come back for.',
			whatToBring: ['Grip socks', 'Water'],
			prerequisite: 'One Foundations class first, or reformer experience elsewhere.',
			rooms: { mitte: 'long-room', kreuzberg: 'canal-room', 'prenzlauer-berg': 'courtyard-room' },
		},
		sculpt: {
			short: 'Sculpt',
			spring: 'blue',
			level: 'Level 2',
			levelOrder: 2,
			tagline: 'Heavier springs, longer holds, fewer breaks.',
			whatToBring: ['Grip socks', 'Water', 'A towel'],
			prerequisite: 'Around ten Flow classes first.',
			rooms: { mitte: 'long-room', kreuzberg: 'canal-room', 'prenzlauer-berg': 'courtyard-room' },
		},
		'jump-board': {
			short: 'Jump Board',
			spring: 'blue',
			level: 'Level 2',
			levelOrder: 2,
			tagline: 'Reformer cardio: lying-down plyometrics on the jump board, to a loud playlist.',
			whatToBring: ['Grip socks', 'Water', 'A towel'],
			prerequisite: 'Comfortable in Flow.',
			rooms: { mitte: 'long-room', kreuzberg: 'canal-room' },
		},
		tower: {
			short: 'Tower',
			spring: 'red',
			level: 'Level 3',
			levelOrder: 3,
			tagline: 'Six towers, heavy springs, classical repertoire. Our hardest class.',
			whatToBring: ['Grip socks', 'Water', 'A towel'],
			prerequisite: 'Around fifteen Sculpt classes first.',
			rooms: { mitte: 'tower-room' },
		},
		prenatal: {
			short: 'Prenatal',
			spring: 'green',
			level: 'All levels',
			levelOrder: 0,
			tagline: 'Reformer for pregnancy, from the second trimester with your midwife’s OK.',
			whatToBring: ['Grip socks', 'Water', 'Your midwife’s OK'],
			prerequisite: 'From the second trimester, with your midwife or doctor’s OK.',
			rooms: { mitte: 'long-room', kreuzberg: 'canal-room', 'prenzlauer-berg': 'courtyard-room' },
		},
		'mat-props': {
			short: 'Mat & Props',
			spring: 'green',
			level: 'All levels',
			levelOrder: 0,
			tagline: 'Mat Pilates with balls, rings and bands. Bigger room, smaller price.',
			whatToBring: ['Grip socks', 'Water'],
			prerequisite: null,
			rooms: { kreuzberg: 'mat-loft' },
		},
		'online-mat': {
			short: 'Online Mat',
			spring: 'green',
			level: 'All levels',
			levelOrder: 0,
			tagline: 'Thirty minutes of live mat Pilates from home.',
			whatToBring: ['A mat', 'A towel', 'A laptop where the teacher can see you'],
			prerequisite: null,
			rooms: {},
		},
	} satisfies Record<string, ClassMeta>,

	/** Private sessions (the `private` product group). */
	privates: {
		spring: 'yellow' as Spring,
		tagline: 'One teacher, one reformer, your hour. Bring a friend for a duet.',
		formats: {
			solo: { label: '1:1', people: 1, description: 'You and a teacher. Good for a first session, an injury or a goal.' },
			duet: { label: 'Duet', people: 2, description: 'Two people, two reformers, one teacher. Priced per session.' },
		},
	},

	/** Workshops by product slug. */
	workshops: {
		'workshop-spring-calibration': {
			spring: 'blue',
			tagline: 'Two hours on reformer anatomy: what each spring does to your body, and how to pick them yourself.',
			whatToBring: ['Grip socks', 'Water', 'A notebook'],
		},
		'workshop-reformer-for-runners': {
			spring: 'blue',
			tagline: 'Hips, ankles and posterior chain for runners. Bring your training questions.',
			whatToBring: ['Grip socks', 'Water'],
		},
		'workshop-teacher-training-taster': {
			spring: 'blue',
			tagline: 'An afternoon inside our teacher training: cueing, set-ups and teaching your first block.',
			whatToBring: ['Grip socks', 'Water', 'A notebook'],
		},
	} satisfies Record<string, WorkshopMeta>,

	/** The level path: Foundations → Flow → Sculpt → Tower. */
	levels: [
		{
			key: 'foundations',
			label: 'Foundations',
			classKeys: ['foundations'],
			requires: null,
			description: 'Learn the reformer: springs, footbar, straps and the five basics.',
		},
		{
			key: 'flow',
			label: 'Flow',
			classKeys: ['flow'],
			requires: { classKeys: ['foundations'], count: 1 },
			description: 'Full-body classes at a steady pace.',
		},
		{
			key: 'sculpt',
			label: 'Sculpt',
			classKeys: ['sculpt', 'jump-board'],
			requires: { classKeys: ['flow'], count: 10 },
			description: 'Heavier springs and longer holds. Jump Board counts here too.',
		},
		{
			key: 'tower',
			label: 'Tower',
			classKeys: ['tower'],
			requires: { classKeys: ['sculpt'], count: 15 },
			description: 'Classical repertoire on the tower.',
		},
	] satisfies LevelStep[],

	/** Add-on copy by add-on slug (title and price come from the API). */
	addOns: {
		'grip-socks': { blurb: 'Tensile grip socks. Required on the reformer; keep them.' },
		'towel-hire': { blurb: 'A fresh towel waiting on your bed.' },
		'recovery-shake': { blurb: 'Post-class protein shake, collected at the front desk.' },
	} as Record<string, { blurb: string }>,

	footer: {
		description: 'Small-room reformer Pilates in Mitte, Kreuzberg and Prenzlauer Berg, and live online.',
		exploreLinks: [
			{ label: 'Timetable', href: '/timetable' },
			{ label: 'Classes', href: '/classes' },
			{ label: 'Privates', href: '/privates' },
			{ label: 'Workshops', href: '/workshops' },
		],
		companyLinks: [
			{ label: 'Instructors', href: '/instructors' },
			{ label: 'Your account', href: '/account' },
			{ label: 'Sign in', href: '/login' },
		],
		socials: [{ label: 'Instagram', href: 'https://instagram.com/tensile.studio' }],
	},

	/** Main navigation. Studios expand to one link per physical studio in the header. */
	nav: [
		{ label: 'Timetable', href: '/timetable' },
		{ label: 'Classes', href: '/classes' },
		{ label: 'Studios', href: '/studios' },
		{ label: 'Instructors', href: '/instructors' },
		{ label: 'Privates', href: '/privates' },
		{ label: 'Workshops', href: '/workshops' },
	],
};

export type SiteConfig = typeof siteConfig;

/* ------------------------------------------------------------------ Lookups */

/** Studio copy for a location slug, or null. */
export function studioMeta(locationSlug: string | null | undefined): StudioMeta | null {
	if (!locationSlug) return null;
	return (siteConfig.studios as Record<string, StudioMeta>)[locationSlug] ?? null;
}

/** Studio copy for a short studio key (`mitte`), or null. */
export function studioMetaByKey(key: string | null | undefined): (StudioMeta & { slug: string }) | null {
	if (!key) return null;
	for (const [slug, meta] of Object.entries(siteConfig.studios as Record<string, StudioMeta>)) {
		if (meta.key === key) return { ...meta, slug };
	}
	return null;
}

/** Instructor copy for a staff slug (`lena-hoffmann` or `staff-lena-hoffmann`), or null. */
export function instructorMeta(staffSlug: string | null | undefined): InstructorMeta | null {
	if (!staffSlug) return null;
	const all = siteConfig.instructors as Record<string, InstructorMeta>;
	return all[staffSlug] ?? all[staffSlug.replace(/^staff-/, '')] ?? null;
}

/** Class copy for a class key, or null. */
export function classMeta(classKey: string | null | undefined): ClassMeta | null {
	if (!classKey) return null;
	return (siteConfig.classes as Record<string, ClassMeta>)[classKey] ?? null;
}

/** Workshop copy for a product slug, or null. */
export function workshopMeta(slug: string | null | undefined): WorkshopMeta | null {
	if (!slug) return null;
	return (siteConfig.workshops as Record<string, WorkshopMeta>)[slug] ?? null;
}

/** The room a class runs in at a studio, or null. */
export function roomFor(classKey: string | null | undefined, studioSlug: string | null | undefined): RoomMeta | null {
	const studio = studioMeta(studioSlug);
	const roomKey = classMeta(classKey)?.rooms[studio?.key ?? ''];
	if (!studio || !roomKey) return null;
	return studio.rooms.find((r) => r.key === roomKey) ?? null;
}

/** The private room at a studio, or null. */
export function privateRoomFor(studioSlug: string | null | undefined): RoomMeta | null {
	return studioMeta(studioSlug)?.rooms.find((r) => r.private) ?? null;
}

export function springInfo(spring: Spring): SpringInfo {
	return siteConfig.springs[spring];
}
