"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Cookies from 'js-cookie';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const userData = Cookies.get('ordengo_user');
    if (!userData) return;

    try {
      const user = JSON.parse(userData);
      
      // Use a URL da sua API (ajuste conforme seu .env se necessário)
      const socketInstance = io('https://geral-ordengoapi.r954jc.easypanel.host', {
        transports: ['websocket'],
        reconnection: true
      });

      socketInstance.on('connect', () => {
        console.log('📡 Connected to Socket Server');
        
        // Se for gerente, entra na sala do restaurante
        if (user.role === 'manager' || user.restaurantId) {
          socketInstance.emit('join_room', {
            type: 'waiter', // Dashboard se comporta como 'waiter' para receber alertas de mesa
            restaurantId: user.restaurantId
          });
        }
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    } catch (e) {
      console.error('Error initializing socket:', e);
    }
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
