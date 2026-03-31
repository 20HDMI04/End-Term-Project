import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	useRef,
} from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Animated,
	Modal,
	Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

interface ToastContextType {
	showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [message, setMessage] = useState<string | null>(null);
	const [visible, setVisible] = useState(false);
	const opacity = useRef(new Animated.Value(0)).current;
	const timerRef = useRef<NodeJS.Timeout | null>(null);

	const hideToast = useCallback(() => {
		if (timerRef.current) clearTimeout(timerRef.current);

		Animated.timing(opacity, {
			toValue: 0,
			duration: 200,
			useNativeDriver: true,
		}).start(() => {
			setVisible(false);
			setMessage(null);
		});
	}, [opacity]);

	const showToast = useCallback(
		(msg: string) => {
			if (timerRef.current) clearTimeout(timerRef.current);

			setMessage(msg);
			setVisible(true);

			Animated.timing(opacity, {
				toValue: 1,
				duration: 300,
				useNativeDriver: true,
			}).start();

			timerRef.current = setTimeout(hideToast, 3000);
		},
		[hideToast, opacity],
	);

	return (
		<ToastContext.Provider value={{ showToast }}>
			<View style={{ flex: 1 }}>
				{children}

				{visible && (
					<Animated.View
						style={[styles.toastContainer, { opacity }]}
						pointerEvents="box-none"
					>
						<TouchableOpacity
							activeOpacity={0.9}
							onPress={hideToast}
							style={styles.toast}
						>
							<Text style={styles.text}>{message}</Text>
						</TouchableOpacity>
					</Animated.View>
				)}
			</View>
		</ToastContext.Provider>
	);
};

export const useToast = () => {
	const context = useContext(ToastContext);
	if (!context) throw new Error("useToast must be used within ToastProvider");
	return context;
};

const styles = StyleSheet.create({
	toastContainer: {
		position: "absolute",
		bottom: 90,
		left: 0,
		right: 0,
		alignItems: "center",
		justifyContent: "center",
		zIndex: 9999,
		elevation: 10,
		pointerEvents: "box-none",
	},
	toast: {
		backgroundColor: "#e7e5e5",
		paddingVertical: 14,
		paddingHorizontal: 20,
		borderRadius: 10,
		width: "85%",
	},
	text: {
		color: "#333",
		fontSize: 14,
		textAlign: "center",
	},
});
