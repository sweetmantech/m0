import React from 'react';

interface DeploymentEventsProps {
  logs: any[];
}

export function DeploymentEvents({ logs }: DeploymentEventsProps) {
  if (!logs || !Array.isArray(logs) || logs.length === 0) return null;
  return (
    <div className="mt-4 text-left max-h-64 overflow-y-auto border-t pt-2">
      <h4 className="text-sm font-semibold mb-2">Latest Build Logs</h4>
      <ul className="text-xs font-mono space-y-1">
        {logs.map((log: any, idx: number) => (
          <li key={idx}>
            <span className="font-bold">[{log.type}]</span> {log.created ? new Date(log.created).toLocaleTimeString() : ''}: {log.text}
          </li>
        ))}
      </ul>
    </div>
  );
} 