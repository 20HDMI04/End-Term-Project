import { JSX } from "react";
import {
	View,
	Text,
	Modal,
	ActivityIndicator,
	useColorScheme,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { formsStyles as styles } from "./styles/formsStyles";

interface AuthModalProps {
	visible: boolean;
	loading: boolean;
	message: string | null;
	onClose: () => void;
}

export default function AuthModal({
	visible,
	loading,
	message,
	onClose,
}: AuthModalProps): JSX.Element {
	const colorScheme = useColorScheme();
	const isDarkMode = colorScheme === "dark";

	return (
		<Modal
			animationType="fade"
			transparent={true}
			visible={visible}
			onRequestClose={() => !loading && onClose()}
		>
			<View
				style={styles.centeredView}
				onTouchStart={() => !loading && onClose()}
			>
				<View
					style={[
						styles.modalView,
						{
							backgroundColor: "#ff92a6ff",
						},
					]}
				>
					{loading ? (
						<>
							<ActivityIndicator
								size="large"
								color={isDarkMode ? "#fff" : "#222E3A"}
								style={styles.loadingIndicator}
							/>
							<Text
								style={[
									styles.modalText,
									{
										color: "#B00020",
									},
								]}
							>
								Processing...
							</Text>
						</>
					) : (
						<>
							<View
								style={{
									flexDirection: "row",
									alignItems: "center",
									gap: 30,
								}}
							>
								<Feather name="alert-triangle" size={32} color="#B00020" />
								<View style={{ flexDirection: "column" }}>
									<Text
										style={[
											styles.errorTitle,
											{
												color: "#B00020",
											},
										]}
									>
										Error
									</Text>
									<Text
										style={[
											styles.modalText,
											{
												color: "#B00020",
											},
										]}
										numberOfLines={2}
									>
										{message}
									</Text>
								</View>
							</View>
						</>
					)}
				</View>
			</View>
		</Modal>
	);
}
