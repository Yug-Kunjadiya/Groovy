import React from 'react';
import { Cpu, DollarSign, Activity, FileJson } from 'lucide-react';

export default function TelemetryBadge({ telemetry }) {
  if (!telemetry) return null;

  const { promptTokens, responseTokens, totalTokens, estimatedCost } = telemetry;

  return (
    <div className="telemetry-card">
      <div className="telemetry-title">
        <Activity size={14} />
        <span>Token & Cost Telemetry</span>
      </div>
      <div className="telemetry-grid">
        <div className="telemetry-item">
          <span className="telemetry-label">Prompt Tokens</span>
          <span className="telemetry-value">{promptTokens.toLocaleString()}</span>
        </div>
        <div className="telemetry-item">
          <span className="telemetry-label">Response Tokens</span>
          <span className="telemetry-value">{responseTokens.toLocaleString()}</span>
        </div>
        <div className="telemetry-item">
          <span className="telemetry-label">Total Tokens</span>
          <span className="telemetry-value" style={{ color: 'var(--color-secondary)' }}>
            {totalTokens.toLocaleString()}
          </span>
        </div>
        <div className="cost-highlight">
          <span className="telemetry-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <DollarSign size={12} style={{ color: '#10b981' }} />
            Est. Cost (USD):
          </span>
          <span className="cost-value">
            ${estimatedCost.toFixed(6)}
          </span>
        </div>
      </div>
    </div>
  );
}
