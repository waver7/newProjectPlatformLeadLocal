const prohibitedKeywords = [
  'escort', 'sexual service', 'cocaine', 'meth', 'weapon', 'guns for sale', 'human trafficking', 'fake passport', 'stolen card'
];
const contactPatterns = [
  /\b\+?\d[\d\s\-().]{7,}\b/i,
  /[\w.-]+@[\w.-]+\.[A-Za-z]{2,}/i,
  /https?:\/\//i,
  /\b(telegram|whatsapp|signal|instagram|facebook|snapchat|wechat)\b/i,
  /@\w{3,}/i
];

export function moderateText(text: string) {
  const lowered = text.toLowerCase();
  const badKeyword = prohibitedKeywords.find((k) => lowered.includes(k));
  if (badKeyword) return { status: 'REJECTED' as const, reason: `Prohibited content detected: ${badKeyword}` };
  const hasContact = contactPatterns.some((p) => p.test(text));
  if (hasContact) return { status: 'FLAGGED' as const, reason: 'Potential off-platform contact sharing detected' };
  return { status: 'APPROVED' as const, reason: 'Passed basic moderation' };
}
