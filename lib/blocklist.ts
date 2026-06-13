const BLOCKED_WORDS: string[] = [
  // 日本語
  "死ね",
  "殺す",
  "うんこ",
  "うんち",
  "ちんこ",
  "まんこ",
  "セックス",
  "sex",
  "エロ",
  "ポルノ",
  "porn",
  "fuck",
  "shit",
  "bitch",
  "pussy",
  "dick",
];

export function containsBlockedWord(value: string): boolean {
  const normalized = value.toLowerCase();
  return BLOCKED_WORDS.some((word) => normalized.includes(word.toLowerCase()));
}
