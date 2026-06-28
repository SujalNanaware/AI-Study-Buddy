import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useChatStore = create(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,

      createConversation: (title = 'New Chat') => {
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
        const conv = {
          id,
          title,
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({
          conversations: [conv, ...s.conversations],
          activeConversationId: id,
        }));
        return id;
      },

      setActiveConversation: (id) => set({ activeConversationId: id }),

      addMessage: (conversationId, role, content) => {
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: [...c.messages, { role, content, timestamp: new Date().toISOString() }],
                  updatedAt: new Date().toISOString(),
                  title: c.messages.length === 0 && role === 'user' 
                    ? content.slice(0, 50) + (content.length > 50 ? '...' : '')
                    : c.title,
                }
              : c
          ),
        }));
      },

      deleteConversation: (id) => {
        set((s) => ({
          conversations: s.conversations.filter((c) => c.id !== id),
          activeConversationId:
            s.activeConversationId === id ? null : s.activeConversationId,
        }));
      },

      clearAllConversations: () => set({ conversations: [], activeConversationId: null }),

      getActiveConversation: () => {
        const state = get();
        return state.conversations.find((c) => c.id === state.activeConversationId) || null;
      },
    }),
    {
      name: 'studybuddy-chat',
    }
  )
);
