// src/context/PlaceContext.tsx
import { createContext, useContext, useState } from 'react';

interface PlaceContextType {
    selectedPlace: string;
    setSelectedPlace: (placeId: string) => void;
    triggerCountUp: boolean;
    setTriggerCountUp: (value: boolean) => void;
}

const PlaceContext = createContext<PlaceContextType | undefined>(undefined);

export function PlaceProvider({ children }: { children: React.ReactNode }) {
    const [selectedPlace, setSelectedPlace] = useState<string>('');
    const [triggerCountUp, setTriggerCountUp] = useState<boolean>(false);

    return (
        <PlaceContext.Provider value={{ selectedPlace, setSelectedPlace, triggerCountUp, setTriggerCountUp }}>
            {children}
        </PlaceContext.Provider>
    );
}

export function usePlace() {
    const context = useContext(PlaceContext);
    if (!context) {
        throw new Error('usePlace must be used within a PlaceProvider');
    }
    return context;
}