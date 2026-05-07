# Agent Work Memory

Claude Code, Codex, Cursor 같은 AI 에이전트와 팀이 함께 작업할 때 대화, 커밋, 변경 파일, 실행 명령, 위험 이벤트를 연결해 하루 작업 맥락을 복원하는 팀 기반 작업 기억 시스템입니다.

AI 에이전트가 만든 결과를 그대로 믿는 것이 아니라, 사람이 다시 설명할 수 있는 단위로 묶고 검증하는 것이 목표입니다.

## 현재 MVP

- 로컬 Claude Code / Codex CLI 세션 탐지
- 최근 세션을 작업 영역과 요청 주제 기준으로 묶는 작업 패킷
- 세션별 작업 브리프, 대화 흐름, 증거 품질, 처리 타임라인
- 로컬 Git 커밋 후보 연결과 맞음/아님 판단
- 확인 필요 작업을 마크다운 문서로 저장
- 저장된 문서를 문서함에서 미리보기/복사
- Claude, Codex, Git, 확인 문서 수집 상태 진단

원문 전체 transcript는 기본 저장하지 않습니다. 로컬 `.awm` 디렉터리에 요약, 링크, 리뷰, 문서 상태만 저장합니다.

## 문서

- [PRD](./docs/PRD.md)
- [UX Flows](./docs/UX_FLOWS.md)
- [Design System](./docs/DESIGN_SYSTEM.md)
- [Data Contract](./docs/DATA_CONTRACT.md)
- [Terminal Capture Strategy](./docs/TERMINAL_CAPTURE.md)
- [Competitive Landscape](./docs/COMPETITIVE_LANDSCAPE.md)
- [Open Source Leverage Plan](./docs/OPEN_SOURCE_LEVERAGE.md)

## MVP 실행

```bash
npm run mvp
```

실행 후 브라우저에서 엽니다.

```txt
http://127.0.0.1:5173/
```

`npm run mvp`는 빌드 후 최근 30개의 로컬 Claude Code/Codex 세션 파일을 인덱싱하고, 그 결과를 오늘, 작업 패킷, 작업 확인, 문서함, 수집 설정 화면에 연결합니다.

세션 시간대와 가까운 로컬 Git 커밋은 커밋 후보로 자동 연결됩니다. GitHub App 전에도
작업 세션과 결과 증거의 1차 연결을 확인할 수 있습니다.
`연결 확인`을 누르면 세션-커밋 확정 연결이 `.awm/links.json`에 저장됩니다.

오늘 화면의 `기록 저장`은 현재 보이는 작업 요약을 `.awm/wiki/YYYY-MM-DD-daily.md`로 저장합니다.

작업 확인의 `문서로 남기기`, `처리 완료`, `계속 확인` 판단은 `.awm/reviews.json`에 저장되고, 다음 ingest 때 확인 큐와 작업 패킷에 반영됩니다.

## 로컬 CLI

```bash
npm run cli -- help
npm run cli -- ingest --limit 30
npm run cli -- discover
npm run cli -- today
```

`Capture Setup` 화면에서는 로컬 세션 탐지 상태를, `Today` 화면에서는 실제 ingest된
작업 기억을 볼 수 있습니다. GitHub App 연동은 다음 단계이며 현재 MVP는 로컬
세션 인덱스와 터미널 캡처 prototype을 우선 제공합니다.
