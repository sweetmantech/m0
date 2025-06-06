import React from 'react';

interface DeployLogsProps {
  logs: any[] | string;
}

const DeployLogs: React.FC<DeployLogsProps> = ({ logs }) => {
  if (!logs) return null;
  if (Array.isArray(logs)) {
    return (
      <pre className="bg-zinc-900 text-zinc-100 rounded p-2 text-xs max-h-48 overflow-auto mt-2">
        {logs.map((log: any, idx: number) => (
          <div key={idx}>
            <span className="font-bold">[{log.type}]</span> {log.created ? new Date(log.created).toLocaleTimeString() : ''}: {log.text}
          </div>
        ))}
      </pre>
    );
  }
  return (
    <pre className="bg-zinc-900 text-zinc-100 rounded p-2 text-xs max-h-48 overflow-auto mt-2">
      {logs}
    </pre>
  );
};

export default DeployLogs; 