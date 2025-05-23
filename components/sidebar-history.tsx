'use client';

import {
  SidebarGroup,
  SidebarGroupContent,
} from '@/components/ui/sidebar';

export interface ChatHistory {
  hasMore: boolean;
}

export function SidebarHistory() {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="px-2 text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2">
            Your conversations will appear here once you start chatting!
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
}
