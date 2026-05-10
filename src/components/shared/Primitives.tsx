import type { ReactNode } from "react";
import {
  BookOpen,
  Code2,
  ExternalLink,
  FileCode2,
  GitBranch,
  Link2,
  ShieldAlert,
} from "lucide-react";
import type {
  CaptureAdapter,
  EvidenceLink as EvidenceLinkType,
  RiskSeverity,
} from "../../types";

export function CircleInfoIcon() {
  return <ShieldAlert size={16} />;
}

export function Metric({
  label,
  tone,
  value,
}: {
  label: string;
  tone?: "risk" | "unknown";
  value: string;
}) {
  return (
    <article className={`metric-card ${tone ?? ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

export function SectionHeader({
  action,
  eyebrow,
  title,
}: {
  action?: ReactNode;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="section-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function InfoBlock({ text, title }: { text: string; title: string }) {
  return (
    <article className="info-block">
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

export function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="fact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function EvidenceLink({ evidence }: { evidence: EvidenceLinkType }) {
  return (
    <a className="evidence-link" href={evidence.href}>
      {iconForEvidence(evidence.type)}
      <span>{evidence.label}</span>
      <ExternalLink size={12} />
    </a>
  );
}

function iconForEvidence(type: EvidenceLinkType["type"]) {
  if (type === "commit" || type === "pr") return <GitBranch size={13} />;
  if (type === "file") return <FileCode2 size={13} />;
  if (type === "command") return <Code2 size={13} />;
  if (type === "wiki") return <BookOpen size={13} />;
  return <Link2 size={13} />;
}

export function Badge({
  label,
  tone,
}: {
  label: string;
  tone?: "risk" | "info" | "unknown";
}) {
  return <span className={`badge ${tone ?? ""}`}>{label}</span>;
}

export function SeverityBadge({ severity }: { severity: RiskSeverity }) {
  const label = {
    high: "높음",
    medium: "중간",
    low: "낮음",
  }[severity];

  return <span className={`severity ${severity}`}>{label}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  const labelMap: Record<string, string> = {
    reviewed: "확인 완료",
    needs_explanation: "확인 필요",
    linked: "연결됨",
    unlinked: "미연결",
    unreviewed: "미확인",
    acknowledged: "확인됨",
    resolved: "해결됨",
    connected: "연결됨",
    ready: "준비됨",
    planned: "예정",
    needs_setup: "설정 필요",
  };

  return <span className={`status ${status}`}>{labelMap[status] ?? status}</span>;
}

export function StatusText({ status }: { status: string }) {
  const className =
    status === "연결됨" || status === "사용 가능" || status === "준비됨" || status === "정상" || status === "사용 중"
      ? "connected"
      : "planned";
  return <span className={`status-text ${className}`}>{status}</span>;
}

export function AdapterStatusBadge({ status }: { status: CaptureAdapter["status"] }) {
  const labelMap: Record<CaptureAdapter["status"], string> = {
    connected: "연결됨",
    ready: "준비됨",
    planned: "예정",
    needs_setup: "설정 필요",
  };

  return <span className={`status ${status}`}>{labelMap[status]}</span>;
}
