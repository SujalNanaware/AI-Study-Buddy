import React, { useState, useRef } from 'react';
import { Upload, Send, FileText, Sparkles, Layers, Brain, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import { chatWithDocument, summarizeDocument, generateFlashcards, generateQuiz } from '../../services/gemini';
import { useFlashcardStore } from '../../store/flashcardStore';
import styles from './DocumentsPage.module.css';

export default function DocumentsPage() {
  const [docContent, setDocContent] = useState('');
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [summarizing, setSummarizing] = useState(false);
  const fileInputRef = useRef(null);
  const { createDeck, addCards } = useFlashcardStore();

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const text = await file.text();
      setDocContent(text);
    } else if (file.type === 'application/pdf') {
      // Basic PDF text extraction using FileReader
      try {
        const text = await extractPDFText(file);
        setDocContent(text);
      } catch {
        alert('Failed to read PDF. Try pasting the text directly.');
      }
    } else {
      alert('Supported formats: .txt, .md, .pdf');
    }
  };

  const extractPDFText = async (file) => {
    // Simple approach: read as text (works for some PDFs)
    // For production, we'd use pdfjs-dist
    const arrayBuffer = await file.arrayBuffer();
    const decoder = new TextDecoder('utf-8');
    let text = decoder.decode(arrayBuffer);
    
    // Try to extract readable text between stream markers
    const textParts = [];
    const regex = /\(([^)]+)\)/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match[1].length > 2 && /[a-zA-Z]/.test(match[1])) {
        textParts.push(match[1]);
      }
    }

    if (textParts.length > 0) {
      return textParts.join(' ');
    }
    
    // Fallback
    throw new Error('Could not extract text from PDF');
  };

  const handleAsk = async () => {
    if (!question.trim() || !docContent.trim() || loading) return;

    const q = question.trim();
    setMessages((prev) => [...prev, { role: 'user', content: q }]);
    setQuestion('');
    setLoading(true);

    try {
      const answer = await chatWithDocument(docContent, q);
      setMessages((prev) => [...prev, { role: 'ai', content: answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: `⚠️ Error: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!docContent.trim()) return;
    setSummarizing(true);
    try {
      const s = await summarizeDocument(docContent);
      setSummary(s);
    } catch (err) {
      alert('Failed to summarize: ' + err.message);
    } finally {
      setSummarizing(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!docContent.trim()) return;
    setLoading(true);
    try {
      const cards = await generateFlashcards(docContent, 10);
      const deckId = createDeck('From Document', 'AI Generated');
      addCards(deckId, cards);
      alert(`✅ Created ${cards.length} flashcards! Check the Flashcards page.`);
    } catch (err) {
      alert('Failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const hasDoc = docContent.trim().length > 0;

  return (
    <div className={styles.page}>
      <PageHeader
        title="📄 Document Q&A"
        subtitle="Upload study material and let AI help you understand it"
      />

      <div className={styles.content}>
        {/* Upload / Paste Area */}
        <div className={styles.uploadSection}>
          {hasDoc && (
            <div className={styles.docInfo}>
              <CheckCircle size={16} />
              <span>Document loaded ({docContent.length.toLocaleString()} characters)</span>
            </div>
          )}

          <div
            className={`${styles.uploadZone} ${hasDoc ? styles.active : ''}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className={styles.uploadIcon}>
              <Upload size={24} />
            </div>
            <div className={styles.uploadTitle}>Upload a file</div>
            <div className={styles.uploadDesc}>Supports .txt, .md files</div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.pdf"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>

          <textarea
            className={styles.textPasteArea}
            placeholder="Or paste your study material here..."
            value={docContent}
            onChange={(e) => setDocContent(e.target.value)}
          />

          {hasDoc && (
            <div className={styles.uploadActions}>
              <Button
                variant="secondary"
                size="sm"
                icon={summarizing ? <Loader small variant="spinner" /> : <Sparkles size={14} />}
                onClick={handleSummarize}
                disabled={summarizing}
              >
                Summarize
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={<Layers size={14} />}
                onClick={handleGenerateFlashcards}
                disabled={loading}
              >
                Generate Flashcards
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDocContent('');
                  setMessages([]);
                  setSummary('');
                }}
              >
                Clear
              </Button>
            </div>
          )}
        </div>

        {/* Chat with Document */}
        <div className={styles.chatSection}>
          <div className={styles.chatHeader}>
            💬 Ask about your document
          </div>

          <div className={styles.chatMessages}>
            {messages.length === 0 && (
              <EmptyState
                icon={<FileText size={30} />}
                title={hasDoc ? 'Ask a question' : 'Upload a document first'}
                description={
                  hasDoc
                    ? 'Ask any question about your study material and AI will answer based on the content.'
                    : 'Upload or paste your study material on the left, then ask questions here.'
                }
              />
            )}

            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={`${styles.chatMsg} ${msg.role === 'user' ? styles.user : styles.ai}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className={`${styles.msgAvatar} ${msg.role === 'user' ? styles.userMsg : styles.aiMsg}`}>
                    {msg.role === 'user' ? 'U' : '✨'}
                  </div>
                  <div className={styles.msgBubble}>
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
              <div className={`${styles.chatMsg} ${styles.ai}`}>
                <div className={`${styles.msgAvatar} ${styles.aiMsg}`}>✨</div>
                <div className={styles.msgBubble}>
                  <Loader variant="dots" />
                </div>
              </div>
            )}
          </div>

          <div className={styles.chatInputArea}>
            <input
              className={styles.chatInput}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={hasDoc ? 'Ask about your document...' : 'Upload a document first'}
              disabled={!hasDoc || loading}
            />
            <button
              className={styles.sendBtn}
              onClick={handleAsk}
              disabled={!question.trim() || !hasDoc || loading}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <motion.div
          className={styles.summaryCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={styles.summaryTitle}>📋 Document Summary</div>
          <div className={styles.summaryContent}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
          </div>
        </motion.div>
      )}
    </div>
  );
}
