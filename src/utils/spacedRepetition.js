/**
 * SM-2 Spaced Repetition Algorithm
 * 
 * Quality ratings:
 * 0 - Complete blackout
 * 1 - Incorrect, but recalled upon seeing answer
 * 2 - Incorrect, but answer seemed easy to recall
 * 3 - Correct with significant difficulty
 * 4 - Correct with some hesitation
 * 5 - Perfect response
 */

export function getNextReview(card, quality) {
  let { easeFactor, interval, repetitions } = card;

  if (quality < 3) {
    // Failed — reset
    repetitions = 0;
    interval = 0;
  } else {
    // Passed
    if (repetitions === 0) {
      interval = 1; // 1 day
    } else if (repetitions === 1) {
      interval = 6; // 6 days
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  // Update ease factor
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  // Calculate next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    ...card,
    easeFactor: Math.round(easeFactor * 100) / 100,
    interval,
    repetitions,
    nextReview: nextReview.toISOString(),
    lastReviewed: new Date().toISOString(),
  };
}

export function getCardStatus(card) {
  if (card.repetitions === 0) return 'new';
  if (card.interval >= 21) return 'mastered';
  return 'learning';
}

export function getStatusColor(status) {
  switch (status) {
    case 'new': return 'var(--color-info)';
    case 'learning': return 'var(--color-warning)';
    case 'mastered': return 'var(--color-success)';
    default: return 'var(--text-secondary)';
  }
}
