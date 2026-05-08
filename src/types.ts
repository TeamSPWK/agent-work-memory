export type RiskCategory =
  | "Database"
  | "Migration"
  | "Auth"
  | "Secret"
  | "Infra"
  | "Operational"
  | "Destructive"
  | "Large Diff"
  | "Failed Verification";

export type RiskSeverity = "high" | "medium" | "low";

export type EvidenceType = "commit" | "pr" | "file" | "session" | "command" | "wiki";

export type ToolName = "Claude Code" | "Codex" | "Cursor" | "Other";

export type WorkStatus = "reviewed" | "needs_explanation" | "linked" | "unlinked";

export type CaptureAdapterKind =
  | "github"
  | "claude_hook"
  | "codex_cli"
  | "cursor_cli"
  | "git_hook"
  | "manual";

export type CaptureAdapterStatus = "connected" | "ready" | "planned" | "needs_setup";

export interface EvidenceLink {
  id: string;
  type: EvidenceType;
  label: string;
  href: string;
}

export interface CommitCandidate {
  hash: string;
  shortHash: string;
  subject: string;
  files: string[];
  committedAt?: string;
  confirmed?: boolean;
  rejected?: boolean;
  confidence?: "high" | "medium" | "low";
  matchReason?: string;
  source?: "local_git" | "github";
  sources?: Array<"local_git" | "github" | "local">;
  authorLogin?: string;
  htmlUrl?: string;
  prNumbers?: number[];
}

export interface WorkBrief {
  headline: string;
  objective: string;
  actualChange: string;
  validation: string;
  risk: string;
  handoff: string;
  missing: string[];
  confidence: "high" | "medium" | "low";
  signals: Array<{
    label: string;
    value: string;
  }>;
}

export interface WorkFlowStep {
  id: string;
  index: number;
  time: string;
  kind: "request" | "agent" | "tool" | "verification" | "decision";
  title: string;
  summary: string;
  evidence?: EvidenceLink[];
}

export interface RepositoryActivity {
  id: string;
  name: string;
  owner: string;
  repoFullName?: string;
  repoRoot?: string;
  commits: number;
  prs: number;
  changedFiles: number;
  sessions: number;
  riskCount: number;
  focusAreas: string[];
  lastActivity: string;
  githubLastSyncAt?: string;
  githubCommits?: number;
  githubPullRequests?: number;
  githubChangedFiles?: number;
}

export interface WorkSession {
  id: string;
  title: string;
  tool: ToolName;
  actor: string;
  repo: string;
  repoFullName?: string;
  repoRoot?: string;
  startedAt: string;
  endedAt: string;
  fullIntent?: string;
  intentSummary: string;
  agentSummary: string;
  status: WorkStatus;
  linkedCommits: string[];
  confirmedCommits?: string[];
  rejectedCommits?: string[];
  commitCandidates?: CommitCandidate[];
  evidence: EvidenceLink[];
  unresolved: string[];
  reviewNote?: string;
  reviewedAt?: string;
  issueNote?: {
    path: string;
    title?: string;
    savedAt?: string;
  };
  workBrief?: WorkBrief;
  flowSteps?: WorkFlowStep[];
  parentSessionId?: string;
  segmentIndex?: number;
  segmentCount?: number;
  sourceKind?: "auto" | "manual";
  sourceLabel?: string;
  explainBack: {
    requested: string;
    changed: string;
    verified: string;
    unknown: string;
    askTeam: string;
  };
}

export interface WorkPacket {
  id: string;
  title: string;
  repo: string;
  summary: string;
  status: WorkStatus;
  sessionIds: string[];
  sessionCount: number;
  needsReviewCount: number;
  reviewedCount: number;
  issueNoteCount: number;
  commitCandidateCount: number;
  confirmedCommitCount: number;
  rejectedCommitCount: number;
  riskCount: number;
  evidenceScore: number;
  evidenceGrade: "좋음" | "보통" | "낮음";
  lastActivity: string;
  nextAction: string;
  signals: Array<{
    label: string;
    value: string;
  }>;
  timeline: Array<{
    id: string;
    time: string;
    title: string;
    text: string;
    kind: "session" | "document" | "review" | "commit" | "risk";
  }>;
}

export interface CaptureAdapter {
  id: string;
  kind: CaptureAdapterKind;
  name: string;
  status: CaptureAdapterStatus;
  environment: "web" | "terminal" | "git" | "manual";
  priority: "mvp" | "next" | "later";
  captures: string[];
  setupCommand: string;
  notes: string;
}

export interface TerminalEvent {
  id: string;
  time: string;
  tool: ToolName;
  cwd: string;
  event: string;
  summary: string;
  risk?: RiskSeverity;
  evidence: EvidenceLink[];
}

export interface TimelineEvent {
  id: string;
  time: string;
  actor: string;
  type: string;
  summary: string;
  repo: string;
  severity?: RiskSeverity;
  evidence: EvidenceLink[];
}

export interface RiskEvent {
  id: string;
  category: RiskCategory;
  severity: RiskSeverity;
  title: string;
  repo: string;
  file: string;
  time: string;
  actor: string;
  reason: string;
  status: "unreviewed" | "acknowledged" | "resolved";
  evidence: EvidenceLink[];
}

export interface WikiEntry {
  id: string;
  type: "Daily Note" | "Incident Note" | "Repo Context" | "Decision Log";
  title: string;
  updatedAt: string;
  visibility: "private" | "team" | "repo";
  summary: string;
}
