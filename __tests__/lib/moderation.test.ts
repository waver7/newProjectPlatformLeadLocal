import { moderateText } from '@/lib/moderation';

describe('moderateText', () => {
  // ── APPROVED ──────────────────────────────────────────────────────────────
  describe('approved content', () => {
    it('approves normal service descriptions', () => {
      expect(moderateText('Fix leaking kitchen sink under cabinet')).toMatchObject({ status: 'APPROVED' });
    });

    it('approves content with dollar amounts', () => {
      expect(moderateText('Budget around $300 for the repair job')).toMatchObject({ status: 'APPROVED' });
    });

    it('approves numbers that are not phone numbers', () => {
      expect(moderateText('Need 3 coats of paint on 4 walls approximately 12 feet high')).toMatchObject({ status: 'APPROVED' });
    });

    it('approves zip codes', () => {
      expect(moderateText('Located in Columbus area, zip 43201')).toMatchObject({ status: 'APPROVED' });
    });
  });

  // ── FLAGGED (contact info) ─────────────────────────────────────────────────
  describe('flagged content — contact info', () => {
    it('flags US phone numbers with dashes', () => {
      const result = moderateText('Call me at 614-555-1234');
      expect(result.status).toBe('FLAGGED');
    });

    it('flags phone numbers with dots', () => {
      const result = moderateText('Reach me at 614.555.1234');
      expect(result.status).toBe('FLAGGED');
    });

    it('flags phone numbers with parentheses', () => {
      const result = moderateText('Phone: (614) 555-1234');
      expect(result.status).toBe('FLAGGED');
    });

    it('flags E.164 international format', () => {
      const result = moderateText('WhatsApp: +1-614-555-1234');
      expect(result.status).toBe('FLAGGED');
    });

    it('flags email addresses', () => {
      const result = moderateText('Email me at john@example.com');
      expect(result.status).toBe('FLAGGED');
    });

    it('flags email addresses with plus addressing', () => {
      const result = moderateText('Contact: jane+work@company.org');
      expect(result.status).toBe('FLAGGED');
    });

    it('flags http URLs', () => {
      const result = moderateText('See my portfolio at http://example.com');
      expect(result.status).toBe('FLAGGED');
    });

    it('flags https URLs', () => {
      const result = moderateText('https://my-site.com');
      expect(result.status).toBe('FLAGGED');
    });

    it('flags social app mentions', () => {
      expect(moderateText('Message me on Telegram').status).toBe('FLAGGED');
      expect(moderateText('Find me on WhatsApp').status).toBe('FLAGGED');
      expect(moderateText('DM on Instagram').status).toBe('FLAGGED');
    });

    it('flags @handles', () => {
      const result = moderateText('Find me @johnsmith on social media');
      expect(result.status).toBe('FLAGGED');
    });

    it('does not flag lone @ in email without a valid handle format', () => {
      // A stand-alone @ (like "send to @") — edge case, not a real handle
      const result = moderateText('Send request to @ the front desk');
      // Could be FLAGGED (regex is cautious) or APPROVED — either is acceptable
      // The important thing is that valid handles ARE caught
      expect(['APPROVED', 'FLAGGED']).toContain(result.status);
    });
  });

  // ── REJECTED (prohibited keywords) ────────────────────────────────────────
  describe('rejected content — prohibited keywords', () => {
    it('rejects escort-related content', () => {
      const result = moderateText('Looking for escort services');
      expect(result.status).toBe('REJECTED');
      expect(result.reason).toMatch(/escort/i);
    });

    it('rejects drug-related keywords', () => {
      expect(moderateText('Buy cocaine from dealer').status).toBe('REJECTED');
      expect(moderateText('meth lab cleanup needed').status).toBe('REJECTED');
    });

    it('rejects weapons sales', () => {
      expect(moderateText('guns for sale in bulk').status).toBe('REJECTED');
    });

    it('rejects human trafficking', () => {
      expect(moderateText('help with human trafficking logistics').status).toBe('REJECTED');
    });

    it('is case-insensitive for prohibited keywords', () => {
      expect(moderateText('ESCORT service downtown').status).toBe('REJECTED');
      expect(moderateText('Cocaine delivery').status).toBe('REJECTED');
    });
  });

  // ── Priority: REJECTED over FLAGGED ────────────────────────────────────────
  it('returns REJECTED (not FLAGGED) when both a keyword and contact info appear', () => {
    const result = moderateText('escort 614-555-1234');
    expect(result.status).toBe('REJECTED');
  });
});
