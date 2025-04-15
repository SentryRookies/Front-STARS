import { createContext, useContext, useState } from 'react';

const PlaceContext = createContext();

export const PlaceProvider = ({ children }) => {
    const [selectedPlace, setSelectedPlace] = useState("seoulPlaza");
    return (
        <PlaceContext.Provider value={{ selectedPlace, setSelectedPlace }}>
            {children}
        </PlaceContext.Provider>
    );
};

export const usePlace = () => useContext(PlaceContext);