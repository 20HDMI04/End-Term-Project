const AuthLayout = () => {
	return (
		<div
			className="auth-page-wrapper"
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				minHeight: "100vh",
				backgroundColor: "#f4f7f6",
				paddingTop: "50px",
			}}
		>
			<div className="auth-logo" style={{ marginBottom: "30px" }}>
				<img src="/readsy_logo.png" alt="Readsy" style={{ width: "200px" }} />
			</div>
		</div>
	);
};

export default AuthLayout;
