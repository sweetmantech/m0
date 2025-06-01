export function getDeploymentFiles(uniqueName: string) {
  return [
    {
      file: 'package.json',
      data: JSON.stringify({
        name: uniqueName,
        version: '1.0.0',
        private: true,
        scripts: { build: 'next build', start: 'next start' },
        dependencies: { next: '14.2.0', react: '18.2.0', 'react-dom': '18.2.0' },
      }, null, 2),
      encoding: 'utf-8',
    },
    {
      file: 'pages/index.js',
      data: "export default function Home() { return <h1>Hello from hard-coded Next.js!</h1>; }",
      encoding: 'utf-8',
    },
    {
      file: 'vercel.json',
      data: JSON.stringify({ version: 2 }),
      encoding: 'utf-8',
    },
  ];
} 