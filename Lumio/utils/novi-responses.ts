/**
 * Simple response logic for Novi
 * In production, this would be replaced with AI integration
 */

const SAFE_SUPPORT_MESSAGE = `I'm here with you, and I want to make sure you're safe. 

If you're in immediate danger, please reach out to emergency services in your area right away. You can also contact a crisis helpline—they're available 24/7 and ready to listen.

Your wellbeing matters. Please reach out to someone you trust or a professional who can support you.`;

const REFLECTIVE_RESPONSES = [
  "That sounds heavy.",
  "What part feels hardest right now?",
  "We don't need to solve it—let's understand it.",
  "Take your time. I'm here.",
  "What does that feel like in your body?",
  "What would it mean if you could let that go?",
  "You're doing the work of noticing. That matters.",
  "Sometimes just naming it helps.",
  "What's underneath that feeling?",
  "You don't have to have it all figured out.",
];

const CLARITY_RESPONSES = [
  "Let's slow this down together.",
  "What's the one thing that feels most unclear?",
  "Sometimes clarity comes from asking the right questions.",
  "What would help you see this more clearly?",
  "Let's break this into smaller pieces.",
  "What's the first thing that comes to mind?",
  "There's no rush. We can explore this step by step.",
];

const OVERWHELM_RESPONSES = [
  "I hear you. That's a lot to carry.",
  "Let's take this one thing at a time.",
  "What feels most overwhelming right now?",
  "You don't have to hold it all at once.",
  "Let's breathe together for a moment.",
  "What would help you feel a little lighter?",
  "One step. One breath. We're here.",
];

function containsSelfHarmKeywords(text: string): boolean {
  const keywords = [
    'kill myself',
    'suicide',
    'end it all',
    'hurt myself',
    'self harm',
    'cutting',
    'not want to live',
  ];
  const lowerText = text.toLowerCase();
  return keywords.some((keyword) => lowerText.includes(keyword));
}

function detectIntent(text: string): 'overwhelm' | 'clarity' | 'reflect' | 'general' {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('overwhelm') || lowerText.includes('too much') || lowerText.includes('can\'t handle')) {
    return 'overwhelm';
  }
  
  if (lowerText.includes('clarity') || lowerText.includes('confused') || lowerText.includes('understand') || lowerText.includes('unclear')) {
    return 'clarity';
  }
  
  if (lowerText.includes('reflect') || lowerText.includes('think about') || lowerText.includes('process')) {
    return 'reflect';
  }
  
  return 'general';
}

export function generateNoviResponse(userMessage: string): string {
  // Safety check first
  if (containsSelfHarmKeywords(userMessage)) {
    return SAFE_SUPPORT_MESSAGE;
  }
  
  const intent = detectIntent(userMessage);
  
  let responses: string[];
  
  switch (intent) {
    case 'overwhelm':
      responses = OVERWHELM_RESPONSES;
      break;
    case 'clarity':
      responses = CLARITY_RESPONSES;
      break;
    case 'reflect':
      responses = REFLECTIVE_RESPONSES;
      break;
    default:
      responses = REFLECTIVE_RESPONSES;
  }
  
  // Select a random response
  const response = responses[Math.floor(Math.random() * responses.length)];
  
  // Sometimes add a follow-up question
  if (Math.random() > 0.5) {
    const followUps = [
      "What comes up when you sit with that?",
      "How does that land for you?",
      "What would it feel like to let that be?",
      "What's one small thing that might help?",
    ];
    const followUp = followUps[Math.floor(Math.random() * followUps.length)];
    return `${response}\n\n${followUp}`;
  }
  
  return response;
}

