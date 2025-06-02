export function parseFilesFromMessageContent(content: string): Array<{ file: string; data: string; encoding: string }> {
  const fileBlocks: Array<{ file: string; data: string; encoding: string }> = [];
  if (!content) return fileBlocks;
  // Regex to match code blocks like ```tsx file="app/page.tsx" ...code...```
  const codeBlockRegex = /```[a-zA-Z]+ file=\"([^\"]+)\"\n([\s\S]*?)```/g;
  let match;
  while ((match = codeBlockRegex.exec(content)) !== null) {
    const [, file, data] = match;
    fileBlocks.push({ file, data: data.trim(), encoding: 'utf-8' });
  }
  return fileBlocks;
} 