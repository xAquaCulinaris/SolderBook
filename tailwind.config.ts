import { join } from 'path';
import type { Config } from 'tailwindcss';
import { skeleton } from '@skeletonlabs/tw-plugin';

const solderTheme = {
	name: 'solder',
	properties: {
		// Primary — Purple
		'--color-primary-50': '250 245 255',
		'--color-primary-100': '243 232 255',
		'--color-primary-200': '233 213 255',
		'--color-primary-300': '216 180 254',
		'--color-primary-400': '192 132 252',
		'--color-primary-500': '168 85 247',
		'--color-primary-600': '147 51 234',
		'--color-primary-700': '126 34 206',
		'--color-primary-800': '107 33 168',
		'--color-primary-900': '88 28 135',
		// Secondary — Slate
		'--color-secondary-50': '248 250 252',
		'--color-secondary-100': '241 245 249',
		'--color-secondary-200': '226 232 240',
		'--color-secondary-300': '203 213 225',
		'--color-secondary-400': '148 163 184',
		'--color-secondary-500': '100 116 139',
		'--color-secondary-600': '71 85 105',
		'--color-secondary-700': '51 65 85',
		'--color-secondary-800': '30 41 59',
		'--color-secondary-900': '15 23 42',
		// Tertiary — Violet
		'--color-tertiary-50': '245 243 255',
		'--color-tertiary-100': '237 233 254',
		'--color-tertiary-200': '221 214 254',
		'--color-tertiary-300': '196 181 253',
		'--color-tertiary-400': '167 139 250',
		'--color-tertiary-500': '139 92 246',
		'--color-tertiary-600': '124 58 237',
		'--color-tertiary-700': '109 40 217',
		'--color-tertiary-800': '91 33 182',
		'--color-tertiary-900': '76 29 149',
		// Success — Emerald
		'--color-success-50': '236 253 245',
		'--color-success-100': '209 250 229',
		'--color-success-200': '167 243 208',
		'--color-success-300': '110 231 183',
		'--color-success-400': '52 211 153',
		'--color-success-500': '16 185 129',
		'--color-success-600': '5 150 105',
		'--color-success-700': '4 120 87',
		'--color-success-800': '6 95 70',
		'--color-success-900': '6 78 59',
		// Warning — Yellow
		'--color-warning-50': '255 251 235',
		'--color-warning-100': '254 243 199',
		'--color-warning-200': '253 230 138',
		'--color-warning-300': '252 211 77',
		'--color-warning-400': '251 191 36',
		'--color-warning-500': '234 179 8',
		'--color-warning-600': '202 138 4',
		'--color-warning-700': '161 98 7',
		'--color-warning-800': '133 77 14',
		'--color-warning-900': '113 63 18',
		// Error — Red
		'--color-error-50': '254 242 242',
		'--color-error-100': '254 226 226',
		'--color-error-200': '254 202 202',
		'--color-error-300': '252 165 165',
		'--color-error-400': '248 113 113',
		'--color-error-500': '239 68 68',
		'--color-error-600': '220 38 38',
		'--color-error-700': '185 28 28',
		'--color-error-800': '153 27 27',
		'--color-error-900': '127 29 29',
		// Surface — Zinc (dark scale)
		'--color-surface-50': '250 250 250',
		'--color-surface-100': '244 244 245',
		'--color-surface-200': '228 228 231',
		'--color-surface-300': '212 212 216',
		'--color-surface-400': '161 161 170',
		'--color-surface-500': '113 113 122',
		'--color-surface-600': '82 82 91',
		'--color-surface-700': '63 63 70',
		'--color-surface-800': '39 39 42',
		'--color-surface-900': '24 24 27',
		// Typography
		'--theme-font-family-base': `Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
		'--theme-font-family-heading': `Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
		'--theme-font-color-base': '255 255 255',
		'--theme-font-color-dark': '255 255 255',
		'--theme-rounded-base': '4px',
		'--theme-rounded-container': '10px',
		'--theme-border-base': '1px',
		'--theme-active-hover-opacity': '0.15'
	}
};

export default {
	darkMode: 'class',
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		join(require.resolve('@skeletonlabs/skeleton'), '../**/*.{html,js,svelte,ts}')
	],
	theme: {
		extend: {}
	},
	plugins: [
		skeleton({
			themes: {
				preset: ['skeleton'],
				custom: [solderTheme]
			}
		})
	]
} satisfies Config;
