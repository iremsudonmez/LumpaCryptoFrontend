import { useState, useRef, useEffect, type FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import { askAi } from '../../api/ai';
import { Spinner } from '../../components/Spinner';
import { ApiError } from '../../api/client';
import { friendlyError } from '../../api/errorMessages';

interface ChatMessage {
  role: 'user' | 'ai' | 'error';
  text: string;
}

export function AiChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // keep the newest message in view
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    setMessages((m) => [...m, { role: 'user', text: question }]);
    setInput('');
    setLoading(true);

    try {
      const res = await askAi(question);
      setMessages((m) => [...m, { role: 'ai', text: res.answer }]);
    } catch (err) {
      const text =
        err instanceof ApiError
          ? friendlyError(err.code, err.message)
          : 'Something went wrong, please try again.';
      setMessages((m) => [...m, { role: 'error', text }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 flex flex-col h-[calc(100vh-65px)]">
      <h2 className="text-lg font-semibold mb-4">CryptoPal AI</h2>

      {/* message list */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {messages.length === 0 && (
          <div className="text-neutral-500 text-sm bg-neutral-900/80 border border-red-900/30 rounded-none px-4 py-6 text-center">
            Ask about your portfolio, recent trades, or market prices.
            <br />
            <span className="text-neutral-600 text-xs">
              e.g. "What do I own?" · "How is BTC doing?" · "Summarize my last trades"
            </span>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-none px-4 py-3 text-sm ${
              msg.role === 'user'
                ? 'ml-auto bg-red-700 text-white shadow-md shadow-red-950/50'
                : msg.role === 'ai'
                  ? 'bg-neutral-900/80 border border-red-900/30 text-neutral-100'
                  : 'bg-red-950/60 border border-red-900/40 text-red-300'
            }`}
          >
            {msg.role === 'ai' ? (
              <div className="prose-chat">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            ) : (
              msg.text
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-neutral-400 text-sm px-1">
            <Spinner />
            Thinking...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* input bar */}
      <form onSubmit={handleSubmit} className="flex gap-2 pt-3 border-t border-red-900/30">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask CryptoPal..."
          maxLength={1000}
          className="flex-1 rounded-none bg-neutral-800 text-white placeholder-neutral-500 px-4 py-2.5 outline-none border border-transparent focus:border-red-700 transition"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-none bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white font-medium px-5 transition shadow-md shadow-red-950/50"
        >
          Send
        </button>
      </form>
    </main>
  );
}