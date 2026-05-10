const prohibitedKeywords = [
  'escort', 'sexual service', 'cocaine', 'meth', 'weapon', 'guns for sale',
  'human trafficking', 'fake passport', 'stolen card'
];

const contactPatterns = [
  // E.164 / common phone formats (requires formatting chars, not bare long numbers)
  /\b\+?1?[-.\s]?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/,
  // Email addresses
  /[\w.+-]+@[\w-]+\.[A-Za-z]{2,}/i,
  // URLs
  /https?:\/\//i,
  // Social app names
  /\b(telegram|whatsapp|signal|instagram|facebook|snapchat|wechat)\b/i,
  // @handles (but not email – handled above)
  /(?<!\S)@[A-Za-z]\w{2,}/
];

export function moderateText(text: string) {
  const lowered = text.toLowerCase();
  const badKeyword = prohibitedKeywords.find((k) => lowered.includes(k));
  if (badKeyword) return { status: 'REJECTED' as const, reason: `Prohibited content: ${badKeyword}` };

  const hit = contactPatterns.find((p) => p.test(text));
  if (hit) return { status: 'FLAGGED' as const, reason: 'Potential off-platform contact detected' };

  return { status: 'APPROVED' as const, reason: 'Passed moderation' };
}
