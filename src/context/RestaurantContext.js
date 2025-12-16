"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const RestaurantContext = createContext({});

export function RestaurantProvider({ children }) {
    const [currency, setCurrency] = useState('EUR');

    useEffect(() => {
        // 1. Tenta pegar do cookie do usuário logado
        const userCookie = Cookies.get('ordengo_user');
        if (userCookie) {
            try {
                const user = JSON.parse(userCookie);
                if (user.Restaurant && user.Restaurant.currency) {
                    setCurrency(user.Restaurant.currency);
                    return;
                }
            } catch (e) {
                console.error("Erro ao ler moeda do cookie:", e);
            }
        }
    }, []);

    return (
        <RestaurantContext.Provider value={{ currency }}>
            {children}
        </RestaurantContext.Provider>
    );
}

export const useRestaurant = () => useContext(RestaurantContext) || {};
