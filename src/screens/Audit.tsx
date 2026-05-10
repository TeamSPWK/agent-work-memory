import * as React from "react";
import {
  ShieldCheck,
  Download,
  FileText,
  AlertCircle,
  Filter as FilterIcon,
  Hash,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { formatDateTime } from "../lib/format";

type RiskSeverity = "low" | "medium" | "high";

type AuditEvent = {
  id: string;
  workspaceId?: string;
  repo?: string;
  source?: string;
  event?: string;
  sessionId?: string;
  cwd?: string;
  summary?: string;
  toolName?: string;
  risk?: { category: string; severity: RiskSeverity; reason?: string };
  evidence?: { type: string; label: string }[];
  payload?: Record<string, unknown>;
  createdAt: string;
};

type RangePreset = "today" | "week" | "month" | "all";

const RANGE_LABEL: Record<RangePreset, string> = {
  today: "오늘",
  week: "최근 7일",
  month: "최근 30일",
  all: "전체",
};

const SEVERITY_LABEL: Record<RiskSeverity, string> = {
  low: "낮음",
  medium: "중간",
  high: "높음",
};

function rangeStart(preset: RangePreset): number {
  const now = Date.now();
  if (preset === "today") {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return start.getTime();
  }
  if (preset === "week") return now - 7 * 24 * 60 * 60 * 1000;
  if (preset === "month") return now - 30 * 24 * 60 * 60 * 1000;
  return 0;
}

function csvEscape(value: unknown): string {
  if (value == null) return "";
  const str = typeof value === "string" ? value : JSON.stringify(value);
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function exportCsv(events: AuditEvent[]): void {
  const headers = [
    "createdAt",
    "workspaceId",
    "repo",
    "source",
    "event",
    "toolName",
    "sessionId",
    "summary",
    "risk_category",
    "risk_severity",
    "risk_reason",
  ];
  const lines = [headers.join(",")];
  for (const e of events) {
    lines.push(
      [
        e.createdAt,
        e.workspaceId,
        e.repo,
        e.source,
        e.event,
        e.toolName,
        e.sessionId,
        e.summary,
        e.risk?.category,
        e.risk?.severity,
        e.risk?.reason,
      ]
        .map(csvEscape)
        .join(",")
    );
  }
  const blob = new Blob(["﻿" + lines.join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `awm-audit-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

interface AuditScreenProps {
  refreshKey?: number;
}

export function AuditScreen({ refreshKey = 0 }: AuditScreenProps) {
  const [events, setEvents] = React.useState<AuditEvent[]>([]);
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = React.useState<string>("");
  const [range, setRange] = React.useState<RangePreset>("month");
  const [sourceFilter, setSourceFilter] = React.useState<string>("");
  const [severityFilter, setSeverityFilter] = React.useState<RiskSeverity | "">("");
  const [search, setSearch] = React.useState<string>("");
  const [reloadAt, setReloadAt] = React.useState<number>(0);

  React.useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    fetch("/api/events")
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const rows: AuditEvent[] = Array.isArray(data) ? data : [];
        rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
        setEvents(rows);
        setStatus("ready");
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey, reloadAt]);

  const sources = React.useMemo(() => {
    const set = new Set<string>();
    for (const e of events) if (e.source) set.add(e.source);
    return Array.from(set).sort();
  }, [events]);

  const filtered = React.useMemo(() => {
    const start = rangeStart(range);
    const q = search.trim().toLowerCase();
    return events.filter((e) => {
      const ts = new Date(e.createdAt).getTime();
      if (ts < start) return false;
      if (sourceFilter && e.source !== sourceFilter) return false;
      if (severityFilter && e.risk?.severity !== severityFilter) return false;
      if (q) {
        const hay = [e.summary, e.event, e.toolName, e.sessionId, e.repo, e.cwd]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [events, range, sourceFilter, severityFilter, search]);

  const aggregates = React.useMemo(() => {
    const byCategory = new Map<string, number>();
    let withRisk = 0;
    for (const e of filtered) {
      if (e.risk) {
        withRisk++;
        const key = `${e.risk.category}/${e.risk.severity}`;
        byCategory.set(key, (byCategory.get(key) ?? 0) + 1);
      }
    }
    return {
      total: filtered.length,
      withRisk,
      byCategory: Array.from(byCategory.entries()).sort((a, b) => b[1] - a[1]),
    };
  }, [filtered]);

  return (
    <div className="audit-screen">
      <header className="audit-header">
        <div>
          <h2>
            <ShieldCheck size={20} aria-hidden /> AI Audit Trail
          </h2>
          <p className="audit-sub">
            인공지능기본법(2026-01-22)·금융위 가이드라인 대응을 위한 *AI 에이전트 작업 감사 추적*. 본 화면은
            누가·언제·어떤 의도로 변경했는지를 시간순으로 보여주고 CSV로 내보낸다.
          </p>
        </div>
        <div className="audit-actions">
          <button
            type="button"
            className="audit-btn"
            onClick={() => setReloadAt(Date.now())}
            disabled={status === "loading"}
            title="다시 불러오기"
          >
            <RefreshCw size={14} aria-hidden /> 새로고침
          </button>
          <button
            type="button"
            className="audit-btn audit-btn-primary"
            disabled={filtered.length === 0}
            onClick={() => exportCsv(filtered)}
            title="현재 필터 결과를 CSV로 내보내기"
          >
            <Download size={14} aria-hidden /> CSV 내보내기 ({filtered.length})
          </button>
          <button
            type="button"
            className="audit-btn"
            disabled
            title="v2.0 출시 시 구현 예정"
          >
            <FileText size={14} aria-hidden /> PDF (v2.0)
          </button>
        </div>
      </header>

      <section className="audit-integrity">
        <Hash size={14} aria-hidden />
        <span>
          <strong>변조 불가성 (해시 체인):</strong>{" "}
          M2 마일스톤에서 SHA-256 hash chain으로 각 이벤트가 직전 해시를 포함해 무결성 검증 가능하게 됩니다.
          현재는 시간순 append-only 보장만 적용 (PRD §5.5).
        </span>
      </section>

      <section className="audit-filters">
        <div className="audit-filter-group">
          <label>
            <Calendar size={12} aria-hidden /> 기간
          </label>
          <div className="audit-range">
            {(Object.keys(RANGE_LABEL) as RangePreset[]).map((key) => (
              <button
                key={key}
                type="button"
                className={`audit-range-btn ${range === key ? "is-active" : ""}`}
                onClick={() => setRange(key)}
              >
                {RANGE_LABEL[key]}
              </button>
            ))}
          </div>
        </div>
        <div className="audit-filter-group">
          <label htmlFor="audit-source">
            <FilterIcon size={12} aria-hidden /> 소스
          </label>
          <select
            id="audit-source"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option value="">전체</option>
            {sources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="audit-filter-group">
          <label htmlFor="audit-severity">위험 심각도</label>
          <select
            id="audit-severity"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as RiskSeverity | "")}
          >
            <option value="">전체</option>
            <option value="high">높음</option>
            <option value="medium">중간</option>
            <option value="low">낮음</option>
          </select>
        </div>
        <div className="audit-filter-group audit-filter-search">
          <label htmlFor="audit-search">검색</label>
          <input
            id="audit-search"
            type="search"
            placeholder="요약·세션·레포·도구 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      <section className="audit-summary">
        <div className="audit-summary-card">
          <span className="audit-summary-label">총 이벤트</span>
          <span className="audit-summary-value">{aggregates.total.toLocaleString()}</span>
        </div>
        <div className="audit-summary-card">
          <span className="audit-summary-label">위험 신호</span>
          <span className="audit-summary-value">{aggregates.withRisk.toLocaleString()}</span>
        </div>
        <div className="audit-summary-categories">
          {aggregates.byCategory.length === 0 ? (
            <span className="audit-empty">필터 결과에 위험 신호 없음</span>
          ) : (
            aggregates.byCategory.map(([key, count]) => {
              const [category, severity] = key.split("/");
              return (
                <span key={key} className={`audit-chip audit-chip-${severity}`}>
                  {category} · {SEVERITY_LABEL[severity as RiskSeverity] ?? severity}
                  <strong>{count}</strong>
                </span>
              );
            })
          )}
        </div>
      </section>

      <section className="audit-table-wrap">
        {status === "loading" && (
          <div className="audit-state">불러오는 중…</div>
        )}
        {status === "error" && (
          <div className="audit-state audit-error">
            <AlertCircle size={14} aria-hidden /> 이벤트 로드 실패: {error}
          </div>
        )}
        {status === "ready" && filtered.length === 0 && (
          <div className="audit-state">조건에 맞는 이벤트가 없습니다.</div>
        )}
        {status === "ready" && filtered.length > 0 && (
          <table className="audit-table">
            <thead>
              <tr>
                <th>시각</th>
                <th>이벤트</th>
                <th>레포</th>
                <th>위험</th>
                <th>요약</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 500).map((e) => (
                <tr key={e.id}>
                  <td className="audit-cell-ts">{formatDateTime(e.createdAt)}</td>
                  <td className="audit-cell-event">
                    <code>{e.event ?? "—"}</code>
                    {e.source && <span className="audit-cell-source">{e.source}</span>}
                  </td>
                  <td className="audit-cell-repo">{e.repo ?? "—"}</td>
                  <td className="audit-cell-risk">
                    {e.risk ? (
                      <span className={`audit-chip audit-chip-${e.risk.severity}`}>
                        {e.risk.category} · {SEVERITY_LABEL[e.risk.severity]}
                      </span>
                    ) : (
                      <span className="audit-cell-dim">—</span>
                    )}
                  </td>
                  <td className="audit-cell-summary">
                    <span title={e.summary}>{e.summary ?? "—"}</span>
                    {e.toolName && <small> ({e.toolName})</small>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {filtered.length > 500 && (
          <p className="audit-trim-note">상위 500건만 표시 — CSV 내보내기는 전체({filtered.length}건) 포함.</p>
        )}
      </section>
    </div>
  );
}
