import React, { useState } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import MailIcon from "@/assets/svgs/mail.svg";
import MailIconLight from "@/assets/svgs/mail-light.svg";

interface EmailInputProps {
	value: string;
	setValue: React.Dispatch<React.SetStateAction<string>>;
	backgroundColor: string;
	fontAndIconColor: string;
	loading: boolean;
	isDarkMode?: boolean;
	stopBounce: () => void;
}

const CustomEmailInput = (Props: EmailInputProps) => {
	return (
		<View
			style={[{ backgroundColor: Props.backgroundColor }, styles.container]}
		>
			{Props.isDarkMode ? (
				<MailIcon color={Props.fontAndIconColor} style={styles.icon} />
			) : (
				<MailIconLight color={Props.fontAndIconColor} style={styles.icon} />
			)}

			<TextInput
				style={styles.input}
				placeholder="Email"
				value={Props.value}
				onChangeText={Props.setValue}
				autoCapitalize="none"
				keyboardType="email-address"
				placeholderTextColor={Props.fontAndIconColor}
				editable={!Props.loading}
				onTouchStart={() => {
					Props.stopBounce();
				}}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",

		borderRadius: 50,
		paddingHorizontal: 15,
		height: 50,
	},
	icon: {
		marginRight: 15,
		opacity: 0.7,
	},
	input: {
		flex: 1,
		fontSize: 16,
		paddingVertical: 10,
	},
});

export default CustomEmailInput;
