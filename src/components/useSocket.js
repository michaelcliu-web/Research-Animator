import { useState, useEffect, useRef, useCallback } from 'react';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

const RECONNECT_DELAYS = [8000, 10000, 30000, 40000, 50000]; // Exponential backoff
const MAX_RECONNECT_ATTEMPTS = 5;
const HEARTBEAT_INTERVAL = 60000; // 60 seconds
const PONG_TIMEOUT = 30000; // 30 seconds to wait for pong - much more generous


export const useSocket = (url) => {
  const [socket, setSocket] = useState(null);
  const [isSocketOpen, setIsSocketOpen] = useState(false);

  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const heartbeatIntervalRef = useRef(null);
  const pongTimeoutRef = useRef(null);
  const intentionalCloseRef = useRef(false);
  const mountedRef = useRef(true);

  const clearTimers = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    if (pongTimeoutRef.current) {
      clearTimeout(pongTimeoutRef.current);
      pongTimeoutRef.current = null;
    }
  }, []);

  const startHeartbeat = useCallback((ws) => {
    heartbeatIntervalRef.current = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }));
        
        // Set timeout for pong response
        pongTimeoutRef.current = setTimeout(() => {
          console.log('WebSocket heartbeat timeout - reconnecting');
          ws.close();
        }, PONG_TIMEOUT);
      }
    }, HEARTBEAT_INTERVAL);
  }, []);

  const handleMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'pong') {
        if (pongTimeoutRef.current) {
          clearTimeout(pongTimeoutRef.current);
          pongTimeoutRef.current = null;
        }
      }
    } catch (e) {
      // Not JSON or no type field - let consumer handle it
    }
  }, []);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;
    
    const token = cookies.get('token');
    if (!token) {
      console.log('WebSocket: No token available');
      return;
    }

    // Clear any existing connection
    if (socketRef.current && socketRef.current.readyState !== WebSocket.CLOSED) {
      intentionalCloseRef.current = true;
      socketRef.current.close();
    }

    try {
      const ws = new WebSocket(`${url}?token=${token}`);
      socketRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        
        console.log('WebSocket connected');
        setIsSocketOpen(true);
        setSocket(ws);
        reconnectAttemptsRef.current = 0;
        
        startHeartbeat(ws);
      };

      ws.onclose = (event) => {
        if (!mountedRef.current) return;
        
        console.log('WebSocket disconnected');
        setIsSocketOpen(false);
        setSocket(null);
        socketRef.current = null;
        
        clearTimers();

        // Handle reconnection
        if (!intentionalCloseRef.current && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = RECONNECT_DELAYS[Math.min(reconnectAttemptsRef.current, RECONNECT_DELAYS.length - 1)];
          console.log(`WebSocket reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${MAX_RECONNECT_ATTEMPTS})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        }
        
        intentionalCloseRef.current = false;
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        ws.close();
      };

      ws.onmessage = handleMessage;

    } catch (error) {
      console.error('WebSocket failed to create:', error);
    }
  }, [url, startHeartbeat, handleMessage, clearTimers]);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      intentionalCloseRef.current = true;
      clearTimers();
      
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [url]); // Re-run the effect if the URL changes

  // Monitor token availability
  useEffect(() => {
    const checkToken = () => {
      const hasToken = !!cookies.get('token');
      const isDisconnected = !socketRef.current || socketRef.current.readyState === WebSocket.CLOSED;
      
      if (hasToken && isDisconnected && reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
        // Token is back and we've exhausted reconnect attempts, try again
        console.log('WebSocket: Token available, attempting reconnection');
        reconnectAttemptsRef.current = 0;
        connect();
      }
    };

    const tokenCheckInterval = setInterval(checkToken, 5000);
    
    return () => clearInterval(tokenCheckInterval);
  }, [connect]);

  return { socket, isSocketOpen };
};