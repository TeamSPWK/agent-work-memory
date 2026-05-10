import { EvidenceLink, SectionHeader } from "../shared/Primitives";
import { labelForTimelineType } from "../../lib/format";
import type { TimelineEvent } from "../../types";

interface TodayTimelineProps {
  events: TimelineEvent[];
}

export function TodayTimeline({ events }: TodayTimelineProps) {
  if (events.length === 0) {
    return (
      <section className="today-timeline empty" aria-label="최근 타임라인">
        <SectionHeader eyebrow="타임라인" title="최근 타임라인" />
        <p>아직 표시할 이벤트가 없습니다.</p>
      </section>
    );
  }

  return (
    <section className="today-timeline" aria-label="최근 타임라인">
      <SectionHeader eyebrow="타임라인" title={`최근 타임라인 (${events.length})`} />
      <ol className="timeline-rows">
        {events.map((event) => (
          <li className="timeline-row" key={event.id}>
            <span className="time">{formatTime(event.time)}</span>
            <span className="type">{labelForTimelineType(event.type)}</span>
            <span className="summary">
              {event.actor ? <span className="actor">{event.actor}</span> : null}
              {event.summary}
            </span>
            <span className="evidence">
              {event.evidence.slice(0, 3).map((ev) => (
                <EvidenceLink key={ev.id} evidence={ev} />
              ))}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function formatTime(value: string) {
  if (!value) return "--:--";
  if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });
}
