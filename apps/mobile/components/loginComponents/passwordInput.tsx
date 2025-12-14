import React, { useState } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import LockIcon from "@/assets/svgs/lock.svg";
import LockIconLight from "@/assets/svgs/lock-light.svg";

interface PasswordInputProps {
	value: string;
	setValue: React.Dispatch<React.SetStateAction<string>>;
	backgroundColor: string;
	fontAndIconColor: string;
	loading: boolean;
	stopBounce: () => void;
	placeholder?: string;
	isDarkMode?: boolean;
}

const CustomPasswordInput = (Props: PasswordInputProps) => {
	const [isSecureEntry, setIsSecureEntry] = useState(true);

	const toggleVisibility = () => {
		setIsSecureEntry(!isSecureEntry);
	};

	return (
		<View
			style={[{ backgroundColor: Props.backgroundColor }, styles.container]}
		>
			{Props.isDarkMode ? (
				<LockIcon fill={Props.fontAndIconColor} style={styles.icon} />
			) : (
				<LockIconLight fill={Props.fontAndIconColor} style={styles.icon} />
			)}

			<TextInput
				style={styles.input}
				placeholder={Props.placeholder || "Password"}
				value={Props.value}
				onChangeText={Props.setValue}
				placeholderTextColor={Props.fontAndIconColor}
				secureTextEntry={isSecureEntry}
				editable={!Props.loading}
				onTouchStart={Props.stopBounce}
			/>

			<TouchableOpacity onPress={toggleVisibility} style={styles.toggleButton}>
				<Feather
					name={isSecureEntry ? "eye-off" : "eye"}
					size={24}
					color={Props.fontAndIconColor}
				/>
			</TouchableOpacity>
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
		marginTop: 10,
	},
	icon: {
		marginRight: 13,
		marginLeft: 2,
		opacity: 0.7,
	},
	input: {
		flex: 1,
		fontSize: 16,
		paddingVertical: 10,
	},
	toggleButton: {
		paddingLeft: 10,
	},
});

export default CustomPasswordInput;
