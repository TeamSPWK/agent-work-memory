import { useSearchParams } from 'react-router-dom'
import { WORKSPACE_TABS } from '../lib/seed/navigation'
import { Icon } from '../components/Icon'
import { tabKeyHandler } from '../lib/useTabKeyboard'
import { Members } from './workspace/Members'
import { Invite } from './workspace/Invite'
import { Roles } from './workspace/Roles'

const TAB_IDS = WORKSPACE_TABS.map((t) => t.id)

type TabId = 'members' | 'invite' | 'roles'

const HEADERS: Record<TabId, { eyebrow: string; title: string; sub: string }> = {
  members: {
    eyebrow: 'Workspace · 상시 화면',
    title: 'Members',
    sub: '현재 워크스페이스의 멤버 · 역할 · 검토 응답 시간을 본다. 가설 검증 대상이 아닌 운영 화면.',
  },
  invite: {
    eyebrow: 'Workspace · Member 초대',
    title: 'Member 초대',
    sub: '이메일 다중 입력 + 역할 지정 + 메일 카피 미리보기.',
  },
  roles: {
    eyebrow: 'Workspace · 역할 매트릭스',
    title: 'Roles & Risk 룰',
    sub: '위험 카테고리 × 역할별 권한. 변경 시 audit log 기록.',
  },
}

export function Workspace() {
  const [params, setParams] = useSearchParams()
  const raw = params.get('tab') ?? 'members'
  const tab: TabId = (TAB_IDS.includes(raw) ? raw : 'members') as TabId
  const head = HEADERS[tab]

  const setTab = (id: TabId) => {
    if (id === 'members') setParams({}, { replace: true })
    else setParams({ tab: id }, { replace: true })
  }

  return (
    <>
      <div className="page-h">
        <div>
          <div className="eyebrow">{head.eyebrow}</div>
          <h1>{head.title}</h1>
          <p>{head.sub}</p>
        </div>
        <div className="actions">
          {tab === 'members' && (
            <>
              <button className="btn" type="button" onClick={() => setTab('roles')}>
                <Icon name="lock" size={14} />
                역할 매트릭스
              </button>
              <button className="btn primary" type="button" onClick={() => setTab('invite')}>
                <Icon name="plus" size={14} />
                멤버 초대
              </button>
            </>
          )}
          {tab === 'invite' && (
            <button className="btn" type="button" onClick={() => setTab('members')}>
              ← Members
            </button>
          )}
          {tab === 'roles' && (
            <button className="btn" type="button" onClick={() => setTab('members')}>
              ← Members
            </button>
          )}
        </div>
      </div>

      <div className="seg" role="tablist" aria-label="Workspace 탭" style={{ marginBottom: 16 }}>
        {WORKSPACE_TABS.map((t) => (
          <button
            key={t.id}
            id={`workspace-tab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            aria-controls={`workspace-panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            className={tab === t.id ? 'active' : ''}
            onClick={() => setTab(t.id as TabId)}
            onKeyDown={tabKeyHandler(
              WORKSPACE_TABS.map((x) => x.id) as TabId[],
              tab,
              setTab,
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`workspace-panel-${tab}`}
        aria-labelledby={`workspace-tab-${tab}`}
        tabIndex={0}
      >
        {tab === 'members' && <Members />}
        {tab === 'invite' && <Invite />}
        {tab === 'roles' && <Roles />}
      </div>
    </>
  )
}
