/**
 * ================================================================
 * READSY - WEB APPLICATION
 * Entry Point / React DOM Root
 * ================================================================
 * File: src/main.tsx
 * Purpose: Initialize React application and mount to DOM
 * 
 * Related Files:
 * → src/App.tsx        Main app component & routing config
 * → src/index.css      Global styles
 * ================================================================
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ApiProvider } from "./context/apiContext";
import { ThemeProvider } from "./context/darkmodeContext";


createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ApiProvider>
			<ThemeProvider>
				<App />
			</ThemeProvider>
		</ApiProvider>
	</StrictMode>
);
