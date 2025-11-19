/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

const secondaryColorLight = "#F7F4EB";
const mainColorDark = "#222E3A";
const mainColorLight = "#597127";
const secondaryColorDark = "#ECEEEB";

export const Colors = {
	mainAndsecondary: {
		mainLight: mainColorLight,
		mainDark: mainColorDark,
		secondaryLight: secondaryColorLight,
		secondaryDark: secondaryColorDark,
	},
	button: {
		backgroundColor: mainColorLight,
	},
	inverseButton: {
		backgroundColor: secondaryColorLight,
		borderColor: mainColorLight,
		borderWidth: 1.5,
	},
	buttonDark: {
		backgroundColor: secondaryColorDark,
	},
	inverseButtonDark: {
		backgroundColor: mainColorDark,
		borderColor: secondaryColorDark,
		borderWidth: 1.5,
	},
	light: {
		text: "#11181C",
		background: secondaryColorLight,
		icon: "#687076",
		tabIconDefault: "#687076",
	},
	dark: {
		background: mainColorDark,
	},
};

export const Fonts = Platform.select({
	ios: {
		/** iOS `UIFontDescriptorSystemDesignDefault` */
		sans: "system-ui",
		/** iOS `UIFontDescriptorSystemDesignSerif` */
		serif: "ui-serif",
		/** iOS `UIFontDescriptorSystemDesignRounded` */
		rounded: "ui-rounded",
		/** iOS `UIFontDescriptorSystemDesignMonospaced` */
		mono: "ui-monospace",
	},
	default: {
		sans: "normal",
		serif: "serif",
		rounded: "normal",
		mono: "monospace",
	},
	web: {
		sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
		serif: "Georgia, 'Times New Roman', serif",
		rounded:
			"'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
		mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
	},
});
