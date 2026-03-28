import type { Workspace, WorkspaceAccess, WorkspaceCredential } from '../types/workflow'

const STORAGE_KEY = 'nexusagent.workspaceCredentials'

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function parseStoredCredentials(): WorkspaceCredential[] {
  if (!canUseStorage()) {
    return []
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(Boolean) as WorkspaceCredential[]
  } catch {
    return []
  }
}

function writeStoredCredentials(credentials: WorkspaceCredential[]) {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials, null, 2))
}

export function listWorkspaceCredentials() {
  return parseStoredCredentials()
}

export function getWorkspaceCredential(workspaceId: string) {
  return parseStoredCredentials().find((credential) => credential.workspace.workspaceId === workspaceId) ?? null
}

export function saveWorkspaceCredential(workspace: Workspace, workspaceAccess: WorkspaceAccess) {
  const credentials = parseStoredCredentials()
  const savedAt = new Date().toISOString()
  const nextCredential: WorkspaceCredential = {
    workspace,
    workspaceAccess,
    savedAt,
  }

  const nextCredentials = credentials.some((credential) => credential.workspace.workspaceId === workspace.workspaceId)
    ? credentials.map((credential) =>
        credential.workspace.workspaceId === workspace.workspaceId
          ? nextCredential
          : credential,
      )
    : [nextCredential, ...credentials]

  writeStoredCredentials(nextCredentials)
  return nextCredential
}

export function updateWorkspaceCredentialSnapshot(workspace: Workspace) {
  const credentials = parseStoredCredentials()
  const nextCredentials = credentials.map((credential) =>
    credential.workspace.workspaceId === workspace.workspaceId
      ? {
          ...credential,
          workspace,
        }
      : credential,
  )

  writeStoredCredentials(nextCredentials)
  return nextCredentials
}

export function removeWorkspaceCredential(workspaceId: string) {
  const credentials = parseStoredCredentials()
  const nextCredentials = credentials.filter((credential) => credential.workspace.workspaceId !== workspaceId)
  writeStoredCredentials(nextCredentials)
  return nextCredentials
}
