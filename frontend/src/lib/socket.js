import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

class SocketService {
    socket = null

    connect() {
        this.socket = io(SOCKET_URL, {
            transports: ['websocket'],
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        })

        this.socket.on('connect', () => {
            console.log('Socket connected')
        })

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected')
        })

        return this.socket
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect()
            this.socket = null
        }
    }
}

export const socketService = new SocketService() 