'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import MultiModalChatUI from '@/components/ui/agents_ui/MultiModalChatUI';

export default function ChatSessionPage() {
  const params = useParams();
  const sessionId = params.id as string;

  return (
    <MultiModalChatUI initialSessionId={sessionId} />
  );
}
