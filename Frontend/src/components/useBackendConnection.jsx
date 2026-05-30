import { useEffect, useState } from 'react';
import { checkBackendConnection, reconnectWithRetries } from './services/connectionService';

/**
 * Hook personalizado para verificar y gestionar la conexión con el backend
 */
export const useBackendConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyConnection = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const connected = await reconnectWithRetries(5, 1500);
        setIsConnected(connected);
        
        if (!connected) {
          setError('No se pudo conectar al backend. Por favor, asegúrate de que el servidor esté corriendo en http://localhost:4000');
        }
      } catch (err) {
        setIsConnected(false);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    verifyConnection();
  }, []);

  return { isConnected, isLoading, error };
};

/**
 * Componente que muestra el estado de la conexión
 */
export const ConnectionStatus = () => {
  const { isConnected, isLoading, error } = useBackendConnection();

  if (isLoading) {
    return (
      <div style={{
        padding: '10px',
        backgroundColor: '#fff3cd',
        color: '#856404',
        borderRadius: '4px',
        marginBottom: '10px',
        textAlign: 'center'
      }}>
        🔄 Conectando con el backend...
      </div>
    );
  }

  if (isConnected) {
    return (
      <div style={{
        padding: '10px',
        backgroundColor: '#d4edda',
        color: '#155724',
        borderRadius: '4px',
        marginBottom: '10px',
        textAlign: 'center'
      }}>
        ✓ Conectado con el backend
      </div>
    );
  }

  return (
    <div style={{
      padding: '10px',
      backgroundColor: '#f8d7da',
      color: '#721c24',
      borderRadius: '4px',
      marginBottom: '10px',
      textAlign: 'center'
    }}>
      ✗ Error: {error}
    </div>
  );
};
