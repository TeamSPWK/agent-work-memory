import { describe, it, expect } from "vitest";
import { isValidCwdValue, inferRepoLabel } from "../bin/lib/repo-parser.mjs";

const mkFile = (path = "/Users/me/develop/swk/myrepo/sessions/abc.jsonl") => ({
  path,
  relativePath: "swk/myrepo/sessions/abc.jsonl",
  source: { id: "claude", label: "Claude Code" },
});

describe("isValidCwdValue — 날짜·짧은 텍스트·1-segment 거름", () => {
  it("absolute path는 valid", () => {
    expect(isValidCwdValue("/Users/me/develop/swk/myrepo")).toBe(true);
    expect(isValidCwdValue("/var/log/app")).toBe(true);
  });

  it("MM/DD 또는 YYYY-MM-DD 날짜 파편은 invalid", () => {
    expect(isValidCwdValue("05/12")).toBe(false);
    expect(isValidCwdValue("12/31")).toBe(false);
    expect(isValidCwdValue("2026-05-12")).toBe(false);
    expect(isValidCwdValue("2026-05-12/new-chat")).toBe(false);
  });

  it("빈 입력·undefined·짧은 텍스트 invalid", () => {
    expect(isValidCwdValue("")).toBe(false);
    expect(isValidCwdValue(undefined)).toBe(false);
    expect(isValidCwdValue("ab")).toBe(false);
    expect(isValidCwdValue("   ")).toBe(false);
  });

  it("1-segment relative path는 invalid (parent 추출 불가)", () => {
    expect(isValidCwdValue("repo")).toBe(false);
    expect(isValidCwdValue("just-a-name")).toBe(false);
  });

  it("2+ segment relative path는 valid (dev/repo 같은 합리 입력)", () => {
    expect(isValidCwdValue("swk/myrepo")).toBe(true);
    expect(isValidCwdValue("./swk/myrepo")).toBe(true);
  });
});

describe("inferRepoLabel — invalid cwdValue 시 file.path 폴백", () => {
  it("absolute path 정상 → parent/name 추출", () => {
    expect(inferRepoLabel("/Users/me/develop/swk/myrepo", mkFile())).toBe("swk/myrepo");
  });

  it("날짜 파편 '05/12' → file.path dirname 기반 폴백", () => {
    const out = inferRepoLabel(
      "05/12",
      mkFile("/Users/me/develop/swk/agent-work-memory/sessions/abc.jsonl"),
    );
    expect(out).toBe("agent-work-memory/sessions");
    expect(out).not.toContain("05");
  });

  it("'2026-05-12/new-chat' → file.path 폴백", () => {
    const out = inferRepoLabel(
      "2026-05-12/new-chat",
      mkFile("/Users/me/develop/swk/nova/sessions/x.jsonl"),
    );
    expect(out).toBe("nova/sessions");
    expect(out).not.toContain("new-chat");
    expect(out).not.toContain("2026");
  });

  it("빈 cwdValue → file.path 폴백", () => {
    const out = inferRepoLabel("", mkFile("/x/y/z/repo/file.jsonl"));
    expect(out).toBe("z/repo");
  });

  it("undefined cwdValue → file.path 폴백, throw 없음", () => {
    const out = inferRepoLabel(undefined, mkFile("/x/y/z/repo/file.jsonl"));
    expect(out).toBe("z/repo");
  });

  it("relative 2+ segment cwdValue 정상", () => {
    expect(inferRepoLabel("swk/myrepo", mkFile())).toBe("swk/myrepo");
  });
});
