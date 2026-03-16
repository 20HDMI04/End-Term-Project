/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext } from "react";
import type { MainPageData } from "../components/interfaces/interfaces";

interface ApiContextType {
    getData: () => Promise<MainPageData>
}

const ApiContext = createContext<ApiContextType>(null as any)


export const ApiProvider = ({ children }: { children: React.ReactNode }) => {

    
        async function getData(): Promise<MainPageData> {
            const res = await fetch("http://localhost:3002/books/mainpage")
            const json = await res.json()
            return json;
        }
        
    

    return (
        <ApiContext.Provider value={{getData}}>
            {children}
        </ApiContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useApi = () => useContext(ApiContext);
