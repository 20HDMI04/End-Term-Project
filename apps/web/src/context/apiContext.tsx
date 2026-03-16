import React, { createContext, useState, useEffect, useContext } from "react";

interface ApiContextType {
    books: any[];
    loading: boolean;
}

const ApiContext = createContext<ApiContextType>({
    books: [],
    loading: true
});

export const ApiProvider = ({ children }: { children: React.ReactNode }) => {

    const [books, setBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:3002/books")
            .then(res => res.json())
            .then(data => {
                setBooks(data.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <ApiContext.Provider value={{ books, loading }}>
            {children}
        </ApiContext.Provider>
    );
};

export const useApi = () => useContext(ApiContext);
