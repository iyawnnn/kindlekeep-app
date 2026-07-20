import { useEffect, useRef } from 'react';
import { HubConnectionBuilder, LogLevel, HubConnectionState } from '@microsoft/signalr';
import { useMonitorStore } from '../store/useMonitorStore';

interface UseSignalROptions {
  monitorId?: string;
  onLog?: (log: string) => void;
}

export const useSignalR = (token: string | null, options?: UseSignalROptions) => {
  const startPromiseRef = useRef<Promise<void> | null>(null);
  
  useEffect(() => {
    if (!token) return;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5247';

    const connection = new HubConnectionBuilder()
      .withUrl(`${apiUrl}/hubs/pulse`, {
        accessTokenFactory: () => token,
      })
      .configureLogging(LogLevel.Warning)
      .withAutomaticReconnect()
      .build();

    connection.on('ReceivePulse', (update) => {
      useMonitorStore.setState((state) => ({
        monitors: state.monitors.map((m) =>
          m.id === update.monitorId
            ? { ...m, currentUptimeStatus: update.newStatus, latencyMs: update.latencyMs }
            : m
        ),
      }));
    });

    if (options?.onLog) {
      connection.on('ReceiveLogStream', options.onLog);
    }

    const startConnection = async () => {
      // Connection State Guard: Do not start if already connecting or connected
      if (connection.state !== HubConnectionState.Disconnected) return;

      try {
        startPromiseRef.current = connection.start();
        await startPromiseRef.current;
        
        // Subscription Logic: Only invoke after connection is established.
        // The early-return guard above narrows connection.state to Disconnected;
        // start() has since changed it, so cast to re-widen for this check.
        if (options?.monitorId && (connection.state as HubConnectionState) === HubConnectionState.Connected) {
          await connection.invoke('SubscribeToMonitor', options.monitorId);
        }
      } catch (error) {
        const err = error as { name?: string; message?: string };
        if (err.name === 'AbortError' || err.message?.includes('stopped during negotiation')) {
          return;
        }
        console.warn('SignalR connection failed:', error);
      } finally {
        startPromiseRef.current = null;
      }
    };

    startConnection();

    return () => {
      const stopConnection = async () => {
        // Handle race condition: wait for start to finish before stopping
        if (startPromiseRef.current) {
          try { await startPromiseRef.current; } catch { /* ignore */ }
        }

        if (connection.state === HubConnectionState.Connected) {
          if (options?.monitorId) {
            await connection.invoke('UnsubscribeFromMonitor', options.monitorId).catch((err) => console.warn('SignalR unsubscribe failed on cleanup:', err));
          }
        }
        
        if (connection.state !== HubConnectionState.Disconnected) {
          await connection.stop();
        }
      };
      
      stopConnection();
    };
  }, [token, options?.monitorId, options?.onLog]);
};