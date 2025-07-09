import React, { useState, useRef, useEffect } from 'react';

const mockMessages = [
  { id: 1, sender: 'You', text: 'Hi there! 👋', time: '09:00' },
  { id: 2, sender: 'Alice', text: 'Hello! How can I help you?', time: '09:01' },
  { id: 3, sender: 'You', text: 'I wanted to connect about a project.', time: '09:02' },
  { id: 4, sender: 'Alice', text: 'Sure, let me know the details.', time: '09:03' },
];

// Rule-based AI reply function
function getAIReply(message: string, botName: string): string {
  const msg = message.toLowerCase();
  if (msg.includes('profile')) {
    return `${botName}: You can view and edit your profile by clicking the profile button at the top. Update your name, job, skills, and more!`;
  }
  if (msg.includes('job') || msg.includes('jobs')) {
    return `${botName}: Check out the Jobs section to browse and apply for jobs. You can also post job openings if you're an employer!`;
  }
  if (msg.includes('post') || msg.includes('posts')) {
    return `${botName}: You can create a new post from the Posts or Create Post page. Posts can include text, images, and more.`;
  }
  if (msg.includes('skill')) {
    return `${botName}: Add your skills in the profile edit section. Skills help others understand your expertise!`;
  }
  if (msg.includes('message') || msg.includes('chat')) {
    return `${botName}: Use this chat to connect with other users or ask me questions about the platform!`;
  }
  if (msg.includes('help') || msg.includes('how')) {
    return `${botName}: I'm here to help! Ask me about profiles, jobs, posts, or anything about this platform.`;
  }
  if (msg.includes('logout') || msg.includes('sign out')) {
    return `${botName}: To log out, click your profile icon and select 'Logout'.`;
  }
  if (msg.includes('image') || msg.includes('photo')) {
    return `${botName}: You can upload or change your profile image by clicking the camera icon on your profile page.`;
  }
  if (msg.includes('connect')) {
    return `${botName}: To connect with others, visit their profile and click the connect button if available.`;
  }
  return `${botName}: Sorry, I didn't understand that. You can ask me about profiles, jobs, posts, skills, or how to use the platform!`;
}

const bots = [
  { name: 'ProkBot', avatar: '🤖', reply: (msg: string) => getAIReply(msg, 'ProkBot') },
  { name: 'CareerBot', avatar: '💼', reply: (msg: string) => getAIReply(msg, 'CareerBot') },
  { name: 'HRBot', avatar: '🧑‍💼', reply: (msg: string) => getAIReply(msg, 'HRBot') },
];

const MessageList: React.FC = () => {
  const [messages, setMessages] = useState(mockMessages);
  const [input, setInput] = useState('');
  const [selectedBot, setSelectedBot] = useState(bots[0]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      const userMsg = { id: messages.length + 1, sender: 'You', text: input, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setMessages(prev => [...prev, userMsg]);
      setInput('');
      // Bot auto-reply after a short delay
      setTimeout(() => {
        const botMsg = {
          id: userMsg.id + 1,
          sender: `${selectedBot.avatar} ${selectedBot.name}`,
          text: selectedBot.reply(userMsg.text),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMsg]);
      }, 700);
    }
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col h-[70vh] bg-white rounded-xl shadow border border-gray-100">
      {/* Bot selector */}
      <div className="flex items-center gap-2 p-3 border-b bg-gray-50 rounded-t-xl">
        <span className="text-2xl">{selectedBot.avatar}</span>
        <span className="font-bold text-lg">{selectedBot.name}</span>
        <select
          className="ml-auto border rounded px-2 py-1 text-sm bg-white"
          value={selectedBot.name}
          onChange={e => {
            const bot = bots.find(b => b.name === e.target.value);
            if (bot) setSelectedBot(bot);
          }}
        >
          {bots.map(bot => (
            <option key={bot.name} value={bot.name}>{bot.avatar} {bot.name}</option>
          ))}
        </select>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender.startsWith('You') ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded-2xl px-4 py-2 max-w-xs ${msg.sender.startsWith('You') ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'}`}
                 title={msg.time}>
              <span className="block text-sm font-medium">{msg.sender}</span>
              <span className="block">{msg.text}</span>
              <span className="block text-xs text-right opacity-60">{msg.time}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 border-t flex gap-2 bg-gray-50">
        <input
          type="text"
          className="flex-1 rounded-full border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder={`Message ${selectedBot.name}...`}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
        />
        <button
          onClick={handleSend}
          className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-md transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          Send
        </button>
      </div>
    </div>
  );
};

export default MessageList; 