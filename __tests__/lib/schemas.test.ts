import {
  registerSchema,
  requestSchema,
  bidSchema,
  messageSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  contractorProfileSchema,
} from '@/lib/schemas';

// ─── registerSchema ────────────────────────────────────────────────────────
describe('registerSchema', () => {
  const valid = { fullName: 'Jane Smith', email: 'jane@example.com', password: 'securepassword', role: 'CLIENT' };

  it('accepts valid client registration', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts valid contractor registration', () => {
    expect(registerSchema.safeParse({ ...valid, role: 'CONTRACTOR' }).success).toBe(true);
  });

  it('rejects too-short full name', () => {
    const r = registerSchema.safeParse({ ...valid, fullName: 'A' });
    expect(r.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const r = registerSchema.safeParse({ ...valid, email: 'not-an-email' });
    expect(r.success).toBe(false);
  });

  it('rejects password shorter than 8 characters', () => {
    const r = registerSchema.safeParse({ ...valid, password: 'short' });
    expect(r.success).toBe(false);
  });

  it('rejects invalid role', () => {
    const r = registerSchema.safeParse({ ...valid, role: 'ADMIN' });
    expect(r.success).toBe(false);
  });
});

// ─── requestSchema ────────────────────────────────────────────────────────
describe('requestSchema', () => {
  const valid = {
    title: 'Fix leaking kitchen sink',
    categoryId: 'cat-abc',
    description: 'The kitchen sink has been dripping for two weeks.',
    city: 'Columbus',
    state: 'OH',
    urgency: 'MEDIUM',
    phonePrivate: '614-555-1234',
    emailPrivate: 'client@example.com',
  };

  it('accepts a fully valid request', () => {
    expect(requestSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects title shorter than 5 characters', () => {
    expect(requestSchema.safeParse({ ...valid, title: 'Fix' }).success).toBe(false);
  });

  it('rejects description shorter than 20 characters', () => {
    expect(requestSchema.safeParse({ ...valid, description: 'Too short' }).success).toBe(false);
  });

  it('rejects invalid urgency value', () => {
    expect(requestSchema.safeParse({ ...valid, urgency: 'CRITICAL' }).success).toBe(false);
  });

  it('accepts all valid urgency values', () => {
    for (const urgency of ['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']) {
      expect(requestSchema.safeParse({ ...valid, urgency }).success).toBe(true);
    }
  });

  it('rejects invalid email for emailPrivate', () => {
    expect(requestSchema.safeParse({ ...valid, emailPrivate: 'not-email' }).success).toBe(false);
  });

  it('coerces budget string to number', () => {
    const r = requestSchema.safeParse({ ...valid, budget: '350' });
    expect(r.success).toBe(true);
    if (r.success) expect(typeof r.data.budget).toBe('number');
  });

  it('rejects negative budget', () => {
    expect(requestSchema.safeParse({ ...valid, budget: '-10' }).success).toBe(false);
  });

  it('allows optional fields to be omitted', () => {
    const { state, zipCode, budget, preferredDate, ...minimal } = { ...valid, zipCode: undefined, budget: undefined, preferredDate: undefined };
    expect(requestSchema.safeParse(minimal).success).toBe(true);
  });
});

// ─── bidSchema ────────────────────────────────────────────────────────────
describe('bidSchema', () => {
  const valid = {
    requestId: 'req-123',
    amount: 250,
    estimatedTimeline: '3-5 business days',
    message: 'I can start tomorrow and complete within the week.',
  };

  it('accepts a valid bid', () => {
    expect(bidSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects zero amount', () => {
    expect(bidSchema.safeParse({ ...valid, amount: 0 }).success).toBe(false);
  });

  it('rejects negative amount', () => {
    expect(bidSchema.safeParse({ ...valid, amount: -50 }).success).toBe(false);
  });

  it('rejects too-short message', () => {
    expect(bidSchema.safeParse({ ...valid, message: 'Hi' }).success).toBe(false);
  });

  it('rejects too-short timeline', () => {
    expect(bidSchema.safeParse({ ...valid, estimatedTimeline: 'x' }).success).toBe(false);
  });

  it('coerces string amount to number', () => {
    const r = bidSchema.safeParse({ ...valid, amount: '150' });
    expect(r.success).toBe(true);
  });
});

// ─── messageSchema ────────────────────────────────────────────────────────
describe('messageSchema', () => {
  it('accepts a valid message', () => {
    expect(messageSchema.safeParse({ conversationId: 'conv-1', content: 'Hello!' }).success).toBe(true);
  });

  it('rejects empty content', () => {
    expect(messageSchema.safeParse({ conversationId: 'conv-1', content: '' }).success).toBe(false);
  });

  it('rejects content exceeding 2000 characters', () => {
    expect(messageSchema.safeParse({ conversationId: 'conv-1', content: 'a'.repeat(2001) }).success).toBe(false);
  });
});

// ─── forgotPasswordSchema ────────────────────────────────────────────────
describe('forgotPasswordSchema', () => {
  it('accepts a valid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'user@example.com' }).success).toBe(true);
  });

  it('rejects an invalid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'not-valid' }).success).toBe(false);
  });
});

// ─── resetPasswordSchema ────────────────────────────────────────────────
describe('resetPasswordSchema', () => {
  const valid = { token: 'a'.repeat(20), password: 'newpassword' };

  it('accepts valid token and password', () => {
    expect(resetPasswordSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects token shorter than 20 characters', () => {
    expect(resetPasswordSchema.safeParse({ ...valid, token: 'short' }).success).toBe(false);
  });

  it('rejects password shorter than 8 characters', () => {
    expect(resetPasswordSchema.safeParse({ ...valid, password: '123' }).success).toBe(false);
  });
});

// ─── contractorProfileSchema ───────────────────────────────────────────
describe('contractorProfileSchema', () => {
  const valid = {
    businessName: 'Acme Plumbing',
    serviceArea: 'Columbus Metro',
    bio: 'Licensed plumber with 10 years experience in residential and commercial work.',
    phone: '614-555-0000',
    email: 'acme@example.com',
  };

  it('accepts a fully valid contractor profile', () => {
    expect(contractorProfileSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts optional website as empty string', () => {
    expect(contractorProfileSchema.safeParse({ ...valid, website: '' }).success).toBe(true);
  });

  it('accepts optional website as valid URL', () => {
    expect(contractorProfileSchema.safeParse({ ...valid, website: 'https://acme.com' }).success).toBe(true);
  });

  it('rejects invalid website URL', () => {
    expect(contractorProfileSchema.safeParse({ ...valid, website: 'not-a-url' }).success).toBe(false);
  });

  it('rejects too-short bio', () => {
    expect(contractorProfileSchema.safeParse({ ...valid, bio: 'Short' }).success).toBe(false);
  });
});
