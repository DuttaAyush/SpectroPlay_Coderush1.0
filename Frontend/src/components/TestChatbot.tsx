import React, { useState } from 'react';
import { EducationalChatbot } from '../utils/chatbot';
import { Button } from './ui/button';

export function TestChatbot() {
  const [chatbot] = useState(() => new EducationalChatbot('DNA Replication'));
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, `You: ${userMessage}`]);
    
    try {
      const response = await chatbot.sendMessage(userMessage);
      setMessages(prev => [...prev, `AI: ${response.text}`]);
    } catch (error) {
      setMessages(prev => [...prev, `Error: ${error}`]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg max-w-md">
      <h3 className="text-white font-bold mb-4">Chatbot Test</h3>
      <div className="h-64 overflow-y-auto bg-gray-900 p-2 rounded mb-4">
        {messages.map((msg, i) => (
          <div key={i} className="text-sm text-gray-300 mb-2">{msg}</div>
        ))}
        {isLoading && <div className="text-blue-400">AI is typing...</div>}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 bg-gray-700 text-white rounded"
        />
        <Button onClick={sendMessage} disabled={isLoading}>
          Send
        </Button>
      </div>
    </div>
  );
}

