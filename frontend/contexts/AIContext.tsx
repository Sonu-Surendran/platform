import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AIContextType {
    contextData: any;
    contextType: string;
    setPageContext: (type: string, data: any) => void;
    clearContext: () => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [contextData, setContextData] = useState<any>(null);
    const [contextType, setContextType] = useState<string>('general');

    const setPageContext = (type: string, data: any) => {
        setContextType(type);
        setContextData(data);
    };

    const clearContext = () => {
        setContextType('general');
        setContextData(null);
    };

    return (
        <AIContext.Provider value={{ contextData, contextType, setPageContext, clearContext }}>
            {children}
        </AIContext.Provider>
    );
};

export const useAIContext = () => {
    const context = useContext(AIContext);
    if (!context) {
        throw new Error('useAIContext must be used within an AIProvider');
    }
    return context;
};
