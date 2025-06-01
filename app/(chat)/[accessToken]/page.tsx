import { cookies } from 'next/headers';
import { Chat } from '@/components/chat';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { DeployProvider } from '@/providers/DeployProvider';

export default async function AccessTokenPage({ params }: { params: Promise<{ accessToken: string }> }) {
  const { accessToken } = await params;
  // Chat UI logic (copied from root route)
  const id = generateUUID();
  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('chat-model');

  // Wrap Chat in DeployProvider, passing accessToken
  return (
    <DeployProvider accessToken={accessToken}>
      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        initialChatModel={modelIdFromCookie?.value || DEFAULT_CHAT_MODEL}
        isReadonly={false}
        autoResume={false}
      />
    </DeployProvider>
  );
} 