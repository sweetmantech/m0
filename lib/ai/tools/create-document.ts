import { DataStreamWriter, tool } from "ai";
import { z } from "zod";

interface CreateDocumentProps {
    dataStream: DataStreamWriter;
}

// Minimal stub for createDocument tool
export const createDocument = ({ dataStream }: CreateDocumentProps) =>
    tool({
  description: 'Create a document (artifact) for code or content generation. This tool will call other functions that will generate the contents of the document based on the title and kind.',
  parameters: z.object({
    title: z.string(),
    kind: z.enum(['text', 'code', 'image', 'sheet'] as const),
  }),
  async execute({ title, kind }: { title: string; kind: string }) {
    // For now, just log and return a stub
    console.log('[createDocument tool] called with:', { title, kind });
    return {
      id: 'stub-id',
      title,
      kind,
      content: 'A document was created and is now visible to the user.',
    };
  },
}); 