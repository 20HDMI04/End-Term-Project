/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext } from "react";
import type { MainPageData } from "../components/interfaces/interfaces";

interface ApiContextType {
    getData: () => Promise<MainPageData>;
    getCurrentUser: () => Promise<any>;
}

const ApiContext = createContext<ApiContextType>(null as any);

export const ApiProvider = ({ children }: { children: React.ReactNode }) => {

    // Main page adatok lekérése
    async function getData(): Promise<MainPageData> {
        const res = await fetch("http://localhost:3002/books/mainpage");
        if (!res.ok) throw new Error("Failed to fetch main page data");
        const json = await res.json();
        return json;
    }

    // Aktuális felhasználó lekérése
    async function getCurrentUser(): Promise<any> {
        const res = await fetch("http://localhost:3002/user/me", {
            credentials: "include" // ha cookie/session alapú auth van
        });
        if (!res.ok) throw new Error("Failed to fetch current user");
        const json = await res.json();
        return json;
    }

    return (
        <ApiContext.Provider value={{ getData, getCurrentUser }}>
            {children}
        </ApiContext.Provider>
    );
};

// Hook az ApiContext használatához
export const useApi = () => useContext(ApiContext);