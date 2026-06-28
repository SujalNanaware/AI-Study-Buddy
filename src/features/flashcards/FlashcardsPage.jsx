import React, { useState, useCallback } from 'react';
import { Plus, Sparkles, ChevronLeft, ChevronRight, Layers, Trash2, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import Loader from '../../components/ui/Loader';
import { useFlashcardStore } from '../../store/flashcardStore';
import { generateFlashcards } from '../../services/gemini';
import styles from './FlashcardsPage.module.css';

export default function FlashcardsPage() {
  const { decks, createDeck, deleteDeck, addCard, addCards, reviewCard, getDeckStats } =
    useFlashcardStore();

  const [selectedDeckId, setSelectedDeckId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Modals
  const [showNewDeck, setShowNewDeck] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckSubject, setNewDeckSubject] = useState('');
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');
  const [generateText, setGenerateText] = useState('');
  const [generateCount, setGenerateCount] = useState(10);
  const [generating, setGenerating] = useState(false);

  // Validation errors
  const [deckNameError, setDeckNameError] = useState('');
  const [cardFrontError, setCardFrontError] = useState('');
  const [cardBackError, setCardBackError] = useState('');
  const [generateTextError, setGenerateTextError] = useState('');

  const selectedDeck = decks.find((d) => d.id === selectedDeckId);
  const cards = selectedDeck?.cards || [];
  const currentCard = cards[currentIndex];

  const closeNewDeckModal = () => {
    setShowNewDeck(false);
    setNewDeckName('');
    setNewDeckSubject('');
    setDeckNameError('');
  };

  const closeAddCardModal = () => {
    setShowAddCard(false);
    setNewCardFront('');
    setNewCardBack('');
    setCardFrontError('');
    setCardBackError('');
  };

  const closeGenerateModal = () => {
    setShowGenerate(false);
    setGenerateText('');
    setGenerateTextError('');
  };

  const handleCreateDeck = () => {
    if (!newDeckName.trim()) {
      setDeckNameError('Deck name is required.');
      return;
    }
    if (newDeckName.trim().length > 50) {
      setDeckNameError('Deck name must be less than 50 characters.');
      return;
    }
    setDeckNameError('');
    const id = createDeck(newDeckName.trim(), newDeckSubject.trim());
    setSelectedDeckId(id);
    closeNewDeckModal();
  };

  const handleAddCard = () => {
    let valid = true;
    if (!newCardFront.trim()) {
      setCardFrontError('Front content (question) is required.');
      valid = false;
    } else {
      setCardFrontError('');
    }

    if (!newCardBack.trim()) {
      setCardBackError('Back content (answer) is required.');
      valid = false;
    } else {
      setCardBackError('');
    }

    if (!valid || !selectedDeckId) return;

    addCard(selectedDeckId, newCardFront.trim(), newCardBack.trim());
    closeAddCardModal();
  };

  const handleGenerate = async () => {
    if (!generateText.trim()) {
      setGenerateTextError('Study material is required.');
      return;
    }
    if (generateText.trim().length < 10) {
      setGenerateTextError('Please provide at least 10 characters of study material for better results.');
      return;
    }
    setGenerateTextError('');
    setGenerating(true);
    try {
      const flashcards = await generateFlashcards(generateText.trim(), generateCount);
      addCards(selectedDeckId, flashcards);
      closeGenerateModal();
    } catch (err) {
      alert('Failed to generate: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((i) => Math.min(i + 1, cards.length - 1));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((i) => Math.max(i - 1, 0));
  };

  const handleConfidence = (quality) => {
    if (!selectedDeckId || !currentCard) return;
    reviewCard(selectedDeckId, currentCard.id, quality);
    if (currentIndex < cards.length - 1) {
      handleNext();
    } else {
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title="📚 Flashcards"
        subtitle="Create, study, and master your flashcards with spaced repetition"
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              icon={<Plus size={16} />}
              onClick={() => setShowNewDeck(true)}
            >
              New Deck
            </Button>
          </>
        }
      />

      {decks.length === 0 ? (
        <EmptyState
          icon={<Layers size={36} />}
          title="No flashcard decks yet"
          description="Create your first deck and start studying! You can add cards manually or let AI generate them from your study material."
          action={
            <Button icon={<Plus size={16} />} onClick={() => setShowNewDeck(true)}>
              Create First Deck
            </Button>
          }
        />
      ) : (
        <div className={styles.content}>
          {/* Deck List */}
          <div className={styles.deckList}>
            {decks.map((deck) => {
              const stats = getDeckStats(deck.id);
              return (
                <motion.div
                  key={deck.id}
                  className={`${styles.deckCard} ${deck.id === selectedDeckId ? styles.active : ''}`}
                  onClick={() => {
                    setSelectedDeckId(deck.id);
                    setCurrentIndex(0);
                    setIsFlipped(false);
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className={styles.deckName}>{deck.name}</div>
                  {deck.subject && <div className={styles.deckSubject}>{deck.subject}</div>}
                  <div className={styles.deckStats}>
                    <span className={`${styles.deckStat} ${styles.statNew}`}>
                      {stats.new} new
                    </span>
                    <span className={`${styles.deckStat} ${styles.statLearning}`}>
                      {stats.learning} learning
                    </span>
                    <span className={`${styles.deckStat} ${styles.statMastered}`}>
                      {stats.mastered} mastered
                    </span>
                  </div>
                  <div className={styles.deckActions}>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Plus size={14} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDeckId(deck.id);
                        setShowAddCard(true);
                      }}
                    >
                      Add
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Sparkles size={14} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDeckId(deck.id);
                        setShowGenerate(true);
                      }}
                    >
                      AI Generate
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 size={14} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this deck?')) {
                          deleteDeck(deck.id);
                          if (selectedDeckId === deck.id) setSelectedDeckId(null);
                        }
                      }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Viewer Area */}
          <div className={styles.viewerArea}>
            {selectedDeck && cards.length > 0 ? (
              <>
                {/* Progress Bar */}
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
                  />
                </div>

                {/* Flashcard */}
                <div className={styles.flashcardContainer} onClick={handleFlip}>
                  <div className={`${styles.flashcard} ${isFlipped ? styles.flipped : ''}`}>
                    <div className={`${styles.cardFace} ${styles.cardFront}`}>
                      <span className={styles.cardLabel}>Question</span>
                      <span className={styles.cardCounter}>
                        {currentIndex + 1}/{cards.length}
                      </span>
                      {currentCard?.front}
                      <span className={styles.flipHint}>Click to reveal answer</span>
                    </div>
                    <div className={`${styles.cardFace} ${styles.cardBack}`}>
                      <span className={styles.cardLabel}>Answer</span>
                      <span className={styles.cardCounter}>
                        {currentIndex + 1}/{cards.length}
                      </span>
                      {currentCard?.back}
                      <span className={styles.flipHint}>Rate your confidence below</span>
                    </div>
                  </div>
                </div>

                {/* Confidence Buttons */}
                {isFlipped && (
                  <motion.div
                    className={styles.confidenceButtons}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <button
                      className={`${styles.confBtn} ${styles.hard}`}
                      onClick={() => handleConfidence(1)}
                    >
                      😰 Hard
                    </button>
                    <button
                      className={`${styles.confBtn} ${styles.medium}`}
                      onClick={() => handleConfidence(3)}
                    >
                      🤔 Medium
                    </button>
                    <button
                      className={`${styles.confBtn} ${styles.easy}`}
                      onClick={() => handleConfidence(5)}
                    >
                      😊 Easy
                    </button>
                  </motion.div>
                )}

                {/* Navigation */}
                <div className={styles.cardNav}>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<ChevronLeft size={16} />}
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<RotateCcw size={16} />}
                    onClick={() => {
                      setCurrentIndex(0);
                      setIsFlipped(false);
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<ChevronRight size={16} />}
                    onClick={handleNext}
                    disabled={currentIndex === cards.length - 1}
                  />
                </div>
              </>
            ) : selectedDeck ? (
              <EmptyState
                icon={<Layers size={36} />}
                title="No cards in this deck"
                description="Add cards manually or let AI generate them from your study material."
                action={
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button size="sm" icon={<Plus size={16} />} onClick={() => setShowAddCard(true)}>
                      Add Card
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Sparkles size={16} />}
                      onClick={() => setShowGenerate(true)}
                    >
                      AI Generate
                    </Button>
                  </div>
                }
              />
            ) : (
              <EmptyState
                icon={<Layers size={36} />}
                title="Select a deck"
                description="Choose a deck from the left to start studying"
              />
            )}
          </div>
        </div>
      )}

      {/* New Deck Modal */}
      <Modal
        isOpen={showNewDeck}
        onClose={closeNewDeckModal}
        title="Create New Deck"
        footer={
          <>
            <Button variant="secondary" onClick={closeNewDeckModal}>Cancel</Button>
            <Button onClick={handleCreateDeck}>Create</Button>
          </>
        }
      >
        <div className={styles.modalForm}>
          <Input
            label="Deck Name"
            placeholder="e.g., Biology Chapter 5"
            value={newDeckName}
            error={deckNameError}
            onChange={(e) => {
              setNewDeckName(e.target.value);
              if (e.target.value.trim()) setDeckNameError('');
            }}
            autoFocus
          />
          <Input
            label="Subject (optional)"
            placeholder="e.g., Biology"
            value={newDeckSubject}
            onChange={(e) => setNewDeckSubject(e.target.value)}
          />
        </div>
      </Modal>

      {/* Add Card Modal */}
      <Modal
        isOpen={showAddCard}
        onClose={closeAddCardModal}
        title="Add Flashcard"
        footer={
          <>
            <Button variant="secondary" onClick={closeAddCardModal}>Cancel</Button>
            <Button onClick={handleAddCard}>
              Add Card
            </Button>
          </>
        }
      >
        <div className={styles.modalForm}>
          <Textarea
            label="Front (Question)"
            placeholder="Enter the question..."
            value={newCardFront}
            error={cardFrontError}
            onChange={(e) => {
              setNewCardFront(e.target.value);
              if (e.target.value.trim()) setCardFrontError('');
            }}
            autoFocus
          />
          <Textarea
            label="Back (Answer)"
            placeholder="Enter the answer..."
            value={newCardBack}
            error={cardBackError}
            onChange={(e) => {
              setNewCardBack(e.target.value);
              if (e.target.value.trim()) setCardBackError('');
            }}
          />
        </div>
      </Modal>

      {/* AI Generate Modal */}
      <Modal
        isOpen={showGenerate}
        onClose={closeGenerateModal}
        title="✨ AI Generate Flashcards"
        footer={
          <>
            <Button variant="secondary" onClick={closeGenerateModal}>Cancel</Button>
            <Button
              onClick={handleGenerate}
              disabled={generating}
              icon={generating ? <Loader small variant="spinner" /> : <Sparkles size={16} />}
            >
              {generating ? 'Generating...' : 'Generate'}
            </Button>
          </>
        }
      >
        <div className={styles.modalForm}>
          <Textarea
            label="Study Material"
            placeholder="Paste your notes, textbook content, or describe the topic..."
            value={generateText}
            error={generateTextError}
            onChange={(e) => {
              setGenerateText(e.target.value);
              if (e.target.value.trim().length >= 10) setGenerateTextError('');
            }}
            style={{ minHeight: '150px' }}
          />
          <Input
            label={`Number of cards (${generateCount})`}
            type="range"
            min={3}
            max={20}
            value={generateCount}
            onChange={(e) => setGenerateCount(Number(e.target.value))}
          />
        </div>
      </Modal>
    </div>
  );
}
