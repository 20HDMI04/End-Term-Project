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
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>
);
