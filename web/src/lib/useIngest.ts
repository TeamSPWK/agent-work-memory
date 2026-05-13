import { useEffect } from 'react'
import { useIngestStore, type IngestWorkPacket } from '../state/ingest'
import type { SessionSeed } from './seed/sessions'
import type { AuditEvent } from './seed/audit'

export type { IngestWorkPacket }

export type IngestState = {
  loading: boolean
  sessions: SessionSeed[]
  workPackets: IngestWorkPacket[]
  auditEvents: AuditEvent[]
  error: string | null
}

export function useIngest(): IngestState {
  const store = useIngestStore()

  useEffect(() => {
    void store.fetch()
  }, [store])

  return {
    loading: store.status === 'loading',
    sessions: store.sessions,
    workPackets: store.workPackets,
    auditEvents: store.auditEvents,
    error: store.error,
  }
}
