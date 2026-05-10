'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { sendMessageAction, type MessageActionState } from '@/app/actions/message-actions';
import { Button, Alert } from '@/components/ui';

const initial: MessageActionState = { error: null, success: null };

function SendButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="shrink-0 self-end">
      {pending ? 'Sending…' : 'Send'}
    </Button>
  );
}

export function SendMessageForm({ conversationId }: { conversationId: string }) {
  const [state, action] = useFormState(sendMessageAction, initial);

  return (
    <div className="space-y-2">
      {state.error && <Alert variant="error">{state.error}</Alert>}
      {state.success && <Alert variant="success">{state.success}</Alert>}
      <form action={action} className="flex gap-2">
        <input type="hidden" name="conversationId" value={conversationId} />
        <textarea
          name="content"
          rows={2}
          placeholder="Type your message…"
          className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          required
          maxLength={2000}
        />
        <SendButton />
      </form>
    </div>
  );
}
