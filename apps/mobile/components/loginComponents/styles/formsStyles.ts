import { StyleSheet } from "react-native";

export const formsStyles = StyleSheet.create({
	centeredView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	modal: {
		position: "absolute",
		zIndex: 1002,
		elevation: 1002,
	},
	modalView: {
		marginTop: -500,
		backgroundColor: "white",
		borderRadius: 20,
		padding: 35,
		paddingTop: 25,
		width: "90%",
		margin: 90,
		height: 120,
	},
	buttonModal: {
		borderRadius: 20,
		padding: 10,
		elevation: 2,
	},
	buttonClose: {
		backgroundColor: "#2196F3",
	},
	textStyle: {
		color: "white",
		fontWeight: "bold",
		textAlign: "center",
	},
	modalText: {
		marginBottom: 20,
		textAlign: "left",
		fontSize: 18,
		lineHeight: 24,

		maxWidth: 200,
	},
	errorTitle: {
		fontSize: 22,
		fontWeight: "bold",
		marginBottom: 12,
		textAlign: "left",
	},
	loadingIndicator: {
		marginBottom: 12,
	},
	container: {
		flex: 1,
		backgroundColor: "#F7F4EB",
	},
	headText: {
		fontFamily: "Poppins_300Light",
		fontSize: 30,
		marginLeft: 10,
		marginBottom: 10,
	},
	keyboardView: {
		flex: 1,
	},
	content: {
		flex: 1,
		justifyContent: "center",
		paddingHorizontal: 24,
	},
	header: {
		alignItems: "center",
	},
	logo: {
		width: 400,
		marginTop: 20,
		resizeMode: "contain",
	},
	subtitle: {
		fontSize: 16,
		color: "#fff",
		opacity: 0.9,
	},
	form: {
		backgroundColor: "#fff",
		borderRadius: 45,
		borderBottomStartRadius: 0,
		borderBottomEndRadius: 0,
		padding: 24,
		paddingTop: 45,
		width: "100%",
		height: "100%",
	},
	inputContainer: {
		marginBottom: 20,
	},
	label: {
		fontSize: 14,
		fontWeight: "600",
		color: "#333",
		marginBottom: 8,
	},
	input: {
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		paddingHorizontal: 16,
		paddingVertical: 12,
		fontSize: 16,
		color: "#333",
		backgroundColor: "#f9f9f9",
	},
	button: {
		marginTop: 20,
		borderRadius: 50,
		paddingVertical: 14,
		alignItems: "center",
	},
	buttonDisabled: {
		opacity: 0.6,
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontFamily: "Poppins_300Light",
		fontWeight: "600",
	},
	dividerContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 20,
	},
	divider: {
		flex: 1,
		height: 1,
		backgroundColor: "#ddd",
	},
	dividerText: {
		marginHorizontal: 12,
		color: "#999",
		fontFamily: "Poppins_300Light",
		fontSize: 16,
		fontWeight: "500",
	},
	googleButton: {
		backgroundColor: "#fff",
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 50,
		paddingVertical: 14,
		height: 52,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 8,
	},
	googleButtonText: {
		marginLeft: 20,
		marginRight: 20,
		color: "#333",
		fontFamily: "Poppins_300Light",
		fontSize: 16,
	},
	switchButton: {
		marginTop: 16,
		alignItems: "center",
	},
	switchText: {
		color: "#222E3A",
		fontSize: 14,
		fontFamily: "Poppins_300Light",
	},
});
