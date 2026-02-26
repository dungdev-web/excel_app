import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface User {
  id: string;
  name: string;
  joinedAt: string;
}

export interface SessionData {
  sessionId: string;
  users: User[];
  companies: string[];
  comparison: any;
}

interface UseCollaborationReturn {
  sessionData: SessionData | null;
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
  joinSession: (sessionId: string, userName: string) => Promise<void>;
  leaveSession: () => void;
  shareComparison: (comparison: any) => void;
  selectCompany: (company: any) => void;
}

export function useCollaboration(): UseCollaborationReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const joinSession = useCallback(
    async (sessionId: string, userName: string) => {
      try {
        setError(null);

        const newSocket = io(process.env.NEXT_PUBLIC_API_URL, {
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5
        });

        newSocket.on('connect', () => {
          setIsConnected(true);
          newSocket.emit('joinSession', { sessionId, userName });
        });

        newSocket.on('userJoined', (data) => {
          setSessionData((prev) =>
            prev
              ? { ...prev, users: data.users }
              : {
                  sessionId,
                  users: data.users,
                  companies: [],
                  comparison: null
                }
          );
        });

        newSocket.on('userLeft', (data) => {
          setSessionData((prev) =>
            prev
              ? { ...prev, users: prev.users }
              : null
          );
        });

        newSocket.on('companySelected', (data) => {
          setSessionData((prev) =>
            prev
              ? { ...prev, companies: [...prev.companies, data.company.id] }
              : null
          );
        });

        newSocket.on('comparisonShared', (data) => {
          setSessionData((prev) =>
            prev ? { ...prev, comparison: data.comparison } : null
          );
        });

        newSocket.on('disconnect', () => {
          setIsConnected(false);
        });

        newSocket.on('error', (err) => {
          setError('WebSocket error: ' + err);
        });

        setSocket(newSocket);
        setSessionData({
          sessionId,
          users: [],
          companies: [],
          comparison: null
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Error joining session:', err);
      }
    },
    []
  );

  const leaveSession = useCallback(() => {
    if (socket) {
      socket.close();
      setSocket(null);
      setSessionData(null);
      setIsConnected(false);
      setError(null);
    }
  }, [socket]);

  const shareComparison = useCallback(
    (comparison: any) => {
      if (socket && sessionData) {
        socket.emit('shareComparison', {
          sessionId: sessionData.sessionId,
          comparison
        });
      }
    },
    [socket, sessionData]
  );

  const selectCompany = useCallback(
    (company: any) => {
      if (socket && sessionData) {
        socket.emit('selectCompany', {
          sessionId: sessionData.sessionId,
          company
        });
      }
    },
    [socket, sessionData]
  );

  useEffect(() => {
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  return {
    sessionData,
    socket,
    isConnected,
    error,
    joinSession,
    leaveSession,
    shareComparison,
    selectCompany
  };
}