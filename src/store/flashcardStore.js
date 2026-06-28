import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getNextReview } from '../utils/spacedRepetition';

export const useFlashcardStore = create(
  persist(
    (set, get) => ({
      decks: [],

      createDeck: (name, subject = '') => {
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
        const deck = {
          id,
          name,
          subject,
          cards: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({ decks: [...s.decks, deck] }));
        return id;
      },

      deleteDeck: (deckId) => {
        set((s) => ({ decks: s.decks.filter((d) => d.id !== deckId) }));
      },

      addCard: (deckId, front, back) => {
        const cardId = Date.now().toString(36) + Math.random().toString(36).slice(2);
        const card = {
          id: cardId,
          front,
          back,
          // SM-2 fields
          easeFactor: 2.5,
          interval: 0,
          repetitions: 0,
          nextReview: new Date().toISOString(),
          lastReviewed: null,
        };
        set((s) => ({
          decks: s.decks.map((d) =>
            d.id === deckId
              ? { ...d, cards: [...d.cards, card], updatedAt: new Date().toISOString() }
              : d
          ),
        }));
        return cardId;
      },

      addCards: (deckId, cards) => {
        const newCards = cards.map((c) => ({
          id: Date.now().toString(36) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2),
          front: c.front,
          back: c.back,
          easeFactor: 2.5,
          interval: 0,
          repetitions: 0,
          nextReview: new Date().toISOString(),
          lastReviewed: null,
        }));
        set((s) => ({
          decks: s.decks.map((d) =>
            d.id === deckId
              ? { ...d, cards: [...d.cards, ...newCards], updatedAt: new Date().toISOString() }
              : d
          ),
        }));
      },

      deleteCard: (deckId, cardId) => {
        set((s) => ({
          decks: s.decks.map((d) =>
            d.id === deckId
              ? { ...d, cards: d.cards.filter((c) => c.id !== cardId), updatedAt: new Date().toISOString() }
              : d
          ),
        }));
      },

      reviewCard: (deckId, cardId, quality) => {
        // quality: 0-5 (0=complete blackout, 5=perfect response)
        set((s) => ({
          decks: s.decks.map((d) =>
            d.id === deckId
              ? {
                  ...d,
                  cards: d.cards.map((c) =>
                    c.id === cardId ? getNextReview(c, quality) : c
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : d
          ),
        }));
      },

      getDueCards: (deckId) => {
        const deck = get().decks.find((d) => d.id === deckId);
        if (!deck) return [];
        const now = new Date();
        return deck.cards.filter((c) => new Date(c.nextReview) <= now);
      },

      getDeckStats: (deckId) => {
        const deck = get().decks.find((d) => d.id === deckId);
        if (!deck) return { total: 0, mastered: 0, learning: 0, new: 0 };
        const now = new Date();
        return {
          total: deck.cards.length,
          mastered: deck.cards.filter((c) => c.interval >= 21).length,
          learning: deck.cards.filter((c) => c.repetitions > 0 && c.interval < 21).length,
          new: deck.cards.filter((c) => c.repetitions === 0).length,
          due: deck.cards.filter((c) => new Date(c.nextReview) <= now).length,
        };
      },

      getTotalStats: () => {
        const decks = get().decks;
        return {
          totalDecks: decks.length,
          totalCards: decks.reduce((sum, d) => sum + d.cards.length, 0),
          mastered: decks.reduce(
            (sum, d) => sum + d.cards.filter((c) => c.interval >= 21).length,
            0
          ),
        };
      },
    }),
    {
      name: 'studybuddy-flashcards',
    }
  )
);
