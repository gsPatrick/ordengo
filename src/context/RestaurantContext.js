"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const RestaurantContext = createContext({});

export function RestaurantProvider({ children }) {
    const [currency, setCurrency] = useState('EUR');
    const [restaurantId, setRestaurantId] = useState('');
    const [restaurantSlug, setRestaurantSlug] = useState('');

    useEffect(() => {
        // 1. Tenta pegar do cookie do usuário logado
        const userCookie = Cookies.get('ordengo_user');
        if (userCookie) {
            try {
                const user = JSON.parse(userCookie);
                if (user.Restaurant) {
                    if (user.Restaurant.currency) setCurrency(user.Restaurant.currency);
                    if (user.Restaurant.id) setRestaurantId(user.Restaurant.id);
                    if (user.Restaurant.slug) setRestaurantSlug(user.Restaurant.slug);
                    return;
                }
            } catch (e) {
                console.error("Erro ao ler dados do cookie:", e);
            }
        }
    }, []);

    return (
        <RestaurantContext.Provider value={{ currency, restaurantId, restaurantSlug }}>
            {children}
        </RestaurantContext.Provider>
    );
}

export const useRestaurant = () => useContext(RestaurantContext) || {};
