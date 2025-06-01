'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { memo } from 'react';
import type { UseChatHelpers } from '@ai-sdk/react';

interface SuggestedActionsProps {
  append: UseChatHelpers['append'];
}

function PureSuggestedActions({
  append,
}: SuggestedActionsProps) {
  const suggestedActions = [
    {
      title: 'Build me a custom Linktree',
      label: `for my next cyberpunk album`,
      action: `Build me a custom Linktree for my next cyberpunk album`,
    },
    {
      title: 'Build a simple hello world page',
      label: 'include the text "Recoup"',
      action: 'Build a simple hello world page to display the text "Recoup"',
    },
    {
      title: 'Build a merch page',
      label: `to sell my album`,
      action: `Build a merch page to sell my album`,
    },
    {
      title: 'Create a collective drop page',
      label: 'to get signups for my next collaborative album',
      action: 'Create a collective drop page to get signups for my next collaborative album',
    },
  ];

  return (
    <div
      data-testid="suggested-actions"
      className="grid sm:grid-cols-2 gap-2 w-full"
    >
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className={index > 1 ? 'hidden sm:block' : 'block'}
        >
          <Button
            variant="ghost"
            onClick={async () => {
              append({
                role: 'user',
                content: suggestedAction.action,
              });
            }}
            className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start"
          >
            <span className="font-medium">{suggestedAction.title}</span>
            <span className="text-muted-foreground">
              {suggestedAction.label}
            </span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(
  PureSuggestedActions,
);
