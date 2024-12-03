import { createContext, useContext, useEffect, useState } from 'react'
import { socketService } from '../lib/socket'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    // Initialize socket connection
    const newSocket = socketService.connect()
    setSocket(newSocket)

    // Cleanup on unmount
    return () => {
      socketService.disconnect()
    }
  }, [])

  // Don't render children until socket is initialized
  if (!socket) {
    return null // Or a loading spinner if you prefer
  }

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  const socket = useContext(SocketContext)
  if (!socket) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return socket
} 