import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize, sep } from "node:path";

// Phase R1 — bin/awm.mjs에서 분리. HTTP 라우터 + 정적 서빙.
// 모든 핸들러는 deps로 주입받아 awm.mjs core와 cyclic import 회피.

export function serveLocalApp(values = [], deps) {
  const {
    projectRoot,
    cwd,
    stateDir,
    discoveryPath,
    ensureState,
    readFlag,
    readPackageVersion,
    localDate,
    persistence,
    receiveGitHubWebhook,
    buildGitHubVisibility,
    scheduleIngestRebuild,
    buildAndStoreDiscovery,
    buildAndStoreIngest,
    getCachedOrBuildIngest,
    readEvents,
    readReviews,
    saveReview,
    saveBulkReviews,
    readLinks,
    saveLink,
    saveManualSession,
    readWikiEntry,
    saveWikiEntry,
    copyWikiEntry,
  } = deps;

  ensureState();
  const port = Number(readFlag(values, "--port") ?? 5173);
  const host = readFlag(values, "--host") ?? "127.0.0.1";
  const staticRoot = join(projectRoot, "dist");

  if (!existsSync(join(staticRoot, "index.html"))) {
    throw new Error("dist/index.html not found. Run npm run build first.");
  }

  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", `http://${host}:${port}`);

    try {
      if (url.pathname === "/api/github/webhook") {
        if (request.method !== "POST") {
          sendJson(response, { ok: false, code: "METHOD_NOT_ALLOWED", message: "POST required." }, 405);
          return;
        }
        const result = await receiveGitHubWebhook(request);
        sendJson(response, result, result.duplicate ? 200 : 202);
        if (!result.duplicate) scheduleIngestRebuild(Number(url.searchParams.get("limit") ?? 30));
        return;
      }

      if (url.pathname === "/api/health") {
        sendJson(response, {
          ok: true,
          cwd,
          stateDir,
          version: readPackageVersion(),
          now: new Date().toISOString(),
          github: buildGitHubVisibility(),
          lastWrite: persistence.getLastWrite(),
          quarantined: persistence.getQuarantined(),
        });
        return;
      }

      if (url.pathname === "/api/persist-events") {
        sendJson(response, persistence.getEventsRing());
        return;
      }

      if (url.pathname === "/api/discovery") {
        const refresh = url.searchParams.get("refresh") === "1";
        const discovery = refresh || !existsSync(discoveryPath)
          ? buildAndStoreDiscovery()
          : JSON.parse(readFileSync(discoveryPath, "utf8"));
        sendJson(response, discovery);
        return;
      }

      if (url.pathname === "/api/events") {
        sendJson(response, readEvents());
        return;
      }

      if (url.pathname === "/api/mvp" || url.pathname === "/api/ingest") {
        const refresh = url.searchParams.get("refresh") === "1";
        const limit = Number(url.searchParams.get("limit") ?? 30);
        const level = url.searchParams.get("level"); // "summary" | null
        const ingest = refresh ? buildAndStoreIngest(limit) : getCachedOrBuildIngest(limit);

        // Phase C8a B1 — `?level=summary` 옵션. 목록 화면(Today/Sessions/Risk)용 경량 응답.
        // flowSteps·commandSamples·evidence·commitCandidates 같은 무거운 필드 제외.
        if (level === "summary") {
          const trimmedSessions = (ingest.sessions ?? []).map((s) => ({
            id: s.id,
            tool: s.tool,
            actor: s.actor,
            repo: s.repo,
            intentSummary: s.intentSummary,
            startedAt: s.startedAt,
            status: s.status,
            commandCount: s.commandCount,
            risks: s.risks,
            relatedRisks: s.relatedRisks,
          }));
          sendJson(response, { ...ingest, sessions: trimmedSessions });
          return;
        }

        sendJson(response, ingest);
        return;
      }

      if (url.pathname === "/api/reviews/bulk" && request.method === "POST") {
        const body = await readRequestJson(request);
        const reviews = await saveBulkReviews(body);
        sendJson(response, { reviews });
        scheduleIngestRebuild(Number(url.searchParams.get("limit") ?? 30));
        return;
      }

      if (url.pathname === "/api/reviews") {
        if (request.method === "GET") {
          sendJson(response, readReviews());
          return;
        }
        if (request.method === "POST") {
          const body = await readRequestJson(request);
          const review = await saveReview(body);
          sendJson(response, review);
          scheduleIngestRebuild(Number(url.searchParams.get("limit") ?? 30));
          return;
        }
      }

      if (url.pathname === "/api/links") {
        if (request.method === "GET") {
          sendJson(response, readLinks());
          return;
        }
        if (request.method === "POST") {
          const body = await readRequestJson(request);
          const link = await saveLink(body);
          buildAndStoreIngest(Number(url.searchParams.get("limit") ?? 30));
          sendJson(response, link);
          return;
        }
      }

      if (url.pathname === "/api/sessions" && request.method === "POST") {
        const body = await readRequestJson(request);
        const session = saveManualSession(body);
        const ingest = buildAndStoreIngest(Number(url.searchParams.get("limit") ?? 30));
        sendJson(response, { session, ingest });
        return;
      }

      if (url.pathname === "/api/today") {
        const events = readEvents().filter((event) => localDate(new Date(event.createdAt)) === localDate(new Date()));
        sendJson(response, {
          date: localDate(new Date()),
          eventCount: events.length,
          riskCount: events.filter((event) => event.risk).length,
          events,
        });
        return;
      }

      if (url.pathname === "/api/wiki") {
        if (request.method === "GET") {
          sendJson(response, readWikiEntry(url.searchParams.get("path")));
          return;
        }
        if (request.method === "POST") {
          const body = await readRequestJson(request);
          sendJson(response, saveWikiEntry(body));
          return;
        }
      }

      if (url.pathname === "/api/wiki/copy" && request.method === "POST") {
        const body = await readRequestJson(request);
        sendJson(response, copyWikiEntry(body));
        return;
      }

      serveStatic(request, response, staticRoot, url.pathname);
    } catch (error) {
      if (response.headersSent || response.writableEnded) {
        response.destroy(error instanceof Error ? error : undefined);
        return;
      }
      const message = error instanceof Error ? error.message : String(error);
      const explicitCode = error && typeof error === "object" && typeof error.code === "string" ? error.code : null;
      const code = explicitCode === "VALIDATION"
        ? "VALIDATION"
        : explicitCode === "AUTH"
          ? "AUTH"
        : explicitCode === "PERSIST_WRITE_FAIL"
          ? "PERSIST_WRITE_FAIL"
          : "INTERNAL";
      const status = code === "VALIDATION" ? 400 : code === "AUTH" ? 401 : code === "PERSIST_WRITE_FAIL" ? 503 : 500;
      sendJson(response, { ok: false, code, message }, status);
    }
  });

  server.listen(port, host, () => {
    console.log(`AWM local app: http://${host}:${port}/`);
    console.log(`API health: http://${host}:${port}/api/health`);
  });
}

function sendJson(response, value, status = 200) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
  });
  response.end(`${JSON.stringify(value, null, 2)}\n`);
}

function serveStatic(request, response, staticRoot, pathname) {
  const requestedPath = decodeURIComponent(pathname === "/" ? "/index.html" : pathname);
  const filePath = safeStaticPath(staticRoot, requestedPath);
  const target = filePath && existsSync(filePath) && statSync(filePath).isFile()
    ? filePath
    : join(staticRoot, "index.html");
  response.writeHead(200, { "content-type": mimeType(target) });
  response.end(readFileSync(target));
}

function safeStaticPath(root, pathname) {
  const withoutLeadingSlash = pathname.replace(/^\/+/, "");
  const normalized = normalize(withoutLeadingSlash);
  if (normalized.startsWith("..") || normalized.includes(`${sep}..${sep}`)) return undefined;
  const fullPath = join(root, normalized);
  return fullPath.startsWith(root) ? fullPath : undefined;
}

function mimeType(filePath) {
  const extension = extname(filePath);
  if (extension === ".html") return "text/html; charset=utf-8";
  if (extension === ".js") return "text/javascript; charset=utf-8";
  if (extension === ".css") return "text/css; charset=utf-8";
  if (extension === ".svg") return "image/svg+xml";
  if (extension === ".json") return "application/json; charset=utf-8";
  return "application/octet-stream";
}

async function readRequestJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  const text = Buffer.concat(chunks).toString("utf8");
  if (!text.trim()) return {};
  return JSON.parse(text);
}
