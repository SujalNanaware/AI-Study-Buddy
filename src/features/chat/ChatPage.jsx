import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, Trash2, MessageSquare, Sparkles, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../../store/chatStore';
import { sendChatMessage, isApiKeyConfigured } from '../../services/gemini';
import { SUGGESTED_PROMPTS } from '../../utils/constants';
import { timeAgo } from '../../utils/helpers';
import styles from './ChatPage.module.css';

export default function ChatPage() {
  const {
    conversations,
    activeConversationId,
    createConversation,
    setActiveConversation,
    addMessage,
    deleteConversation,
    getActiveConversation,
  } = useChatStore();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const activeConv = getActiveConversation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConv?.messages?.length]);

  const handleSend = async (text = input) => {
    if (!text.trim() || loading) return;

    let convId = activeConversationId;
    if (!convId) {
      convId = createConversation();
    }

    addMessage(convId, 'user', text.trim());
    setInput('');
    setLoading(true);

    try {
      // Get the updated conversation
      const conv = useChatStore.getState().conversations.find((c) => c.id === convId);
      const response = await sendChatMessage(conv.messages.slice(0, -1), text.trim());
      addMessage(convId, 'ai', response);
    } catch (err) {
      addMessage(convId, 'ai', `⚠️ **Error:** ${err.message}\n\nPlease check your API key configuration.`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePromptClick = (prompt) => {
    handleSend(prompt);
  };

  return (
    <div className={styles.chatPage}>
      {/* Conversation List Sidebar */}
      <div className={styles.conversationList}>
        <div className={styles.convHeader}>
          <span className={styles.convTitle}>Chats</span>
          <button
            onClick={() => createConversation()}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
            }}
            title="New chat"
          >
            <Plus size={18} />
          </button>
        </div>
        <div className={styles.convItems}>
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`${styles.convItem} ${conv.id === activeConversationId ? styles.active : ''}`}
              onClick={() => setActiveConversation(conv.id)}
            >
              <MessageSquare size={14} style={{ flexShrink: 0, color: 'var(--text-tertiary)' }} />
              <span className={styles.convItemText}>{conv.title}</span>
              <button
                className={styles.convDeleteBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(conv.id);
                }}
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={styles.chatArea}>
        {!isApiKeyConfigured() && (
          <div className={styles.apiWarning}>
            <AlertTriangle size={16} />
            <span>
              Gemini API key not configured. Add your key to <code>.env</code> file as{' '}
              <code>VITE_GEMINI_API_KEY</code>
            </span>
          </div>
        )}

        {activeConv && activeConv.messages.length > 0 ? (
          <>
            {/* Chat Header */}
            <div className={styles.chatHeader}>
              <div>
                <div className={styles.chatHeaderTitle}>{activeConv.title}</div>
                <div className={styles.chatHeaderSubtitle}>
                  {activeConv.messages.length} messages
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className={styles.messages}>
              <AnimatePresence>
                {activeConv.messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    className={`${styles.message} ${msg.role === 'user' ? styles.user : styles.ai}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className={`${styles.avatar} ${msg.role === 'user' ? styles.userAvatar : styles.ai}`}
                    >
                      {msg.role === 'user' ? 'U' : '✨'}
                    </div>
                    <div className={styles.messageBubble}>
                      {msg.role === 'ai' ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {loading && (
                <div className={`${styles.message} ${styles.ai}`}>
                  <div className={`${styles.avatar} ${styles.ai}`}>✨</div>
                  <div className={styles.messageBubble}>
                    <div className={styles.typing}>
                      <div className={styles.typingDot} />
                      <div className={styles.typingDot} />
                      <div className={styles.typingDot} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </>
        ) : (
          /* Welcome Screen */
          <div className={styles.welcome}>
            <div className={styles.welcomeIcon}>
              <Sparkles size={36} color="white" />
            </div>
            <h2 className={styles.welcomeTitle}>How can I help you study?</h2>
            <p className={styles.welcomeSubtitle}>
              Ask me anything — I can explain concepts, create study plans, quiz you on topics, and
              help you master any subject.
            </p>
            <div className={styles.suggestedPrompts}>
              {SUGGESTED_PROMPTS.slice(0, 4).map((prompt, i) => (
                <button
                  key={i}
                  className={styles.promptCard}
                  onClick={() => handlePromptClick(prompt.text)}
                >
                  <span className={styles.promptIcon}>{prompt.icon}</span>
                  <span>{prompt.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className={styles.inputArea}>
          <div className={styles.inputForm}>
            <textarea
              ref={inputRef}
              className={styles.chatInput}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your studies..."
              rows={1}
              disabled={loading}
            />
            <button
              className={styles.sendBtn}
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
