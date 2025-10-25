import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  body: string;
  sender: {
    id: string;
    name: string;
  };
  createdAt: string;
  readBy: Array<{
    userId: string;
    userName: string;
    readAt: string;
  }>;
}

const TestChat: React.FC = () => {
  const { user, tokens } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [hireId, setHireId] = useState('test-hire-123');

  useEffect(() => {
    if (!user || !tokens) return;

    // Initialize Socket.IO connection
    const newSocket = io('http://localhost:4000', {
      auth: {
        token: tokens.accessToken,
      },
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat server');
      setIsConnected(true);
      
      // Join the test chat room
      newSocket.emit('chat:join', { hireId });
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from chat server');
      setIsConnected(false);
    });

    newSocket.on('chat:joined', (data) => {
      console.log('Joined chat room:', data);
    });

    newSocket.on('chat:message:new', (message) => {
      console.log('New message received:', message);
      setMessages(prev => [message, ...prev]);
    });

    newSocket.on('chat:message:read', (data) => {
      console.log('Message read:', data);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user, tokens, hireId]);

  const sendMessage = () => {
    if (!socket || !newMessage.trim()) return;

    socket.emit('chat:message:send', {
      hireId,
      body: newMessage.trim(),
    });

    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to access chat</h1>
          <p>You need to be authenticated to use the chat feature.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-4 border-b">
            <h1 className="text-2xl font-bold">Test Chat</h1>
            <div className="flex items-center gap-4 mt-2">
              <div className={`px-2 py-1 rounded text-sm ${
                isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>
              <div className="text-sm text-gray-600">
                User: {user.name} ({user.role})
              </div>
              <div className="text-sm text-gray-600">
                Hire ID: {hireId}
              </div>
            </div>
          </div>

          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500">
                No messages yet. Start a conversation!
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender.id === user.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender.id === user.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    <div className="text-sm font-medium mb-1">
                      {message.sender.name}
                    </div>
                    <div className="text-sm">{message.body}</div>
                    <div className="text-xs opacity-75 mt-1">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </div>
                    {message.readBy.length > 0 && (
                      <div className="text-xs opacity-75 mt-1">
                        Read by: {message.readBy.map(r => r.userName).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!isConnected}
              />
              <button
                onClick={sendMessage}
                disabled={!isConnected || !newMessage.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestChat;
