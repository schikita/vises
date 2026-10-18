import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useStore } from '@/app/providers'
import type { DocType } from '@/entities/application'
import { nowIso, uid } from '@/shared/lib'
import { ClientApplicationRender } from './ClientApplicationRender'

export const ClientApplication = () => {
  const { id } = useParams()
  const { apps, session, addDoc } = useStore()
  const [docError, setDocError] = useState('')
  const [uploading, setUploading] = useState<DocType | null>(null)
  const app = apps.find(
    (a) =>
      a.id === id &&
      (a.clientEmail === session?.email || a.clientEmail === session?.login),
  )

  const onFile = (type: DocType, file: File) => {
    if (!app) return
    setDocError('')
    setUploading(type)
    void addDoc(
      app.id,
      {
        id: uid('doc'),
        type,
        name: file.name,
        uploadedAt: nowIso(),
      },
      file,
    )
      .catch((err: unknown) =>
        setDocError(err instanceof Error ? err.message : 'Не удалось загрузить'),
      )
      .finally(() => setUploading(null))
  }

  return (
    <ClientApplicationRender
      app={app}
      docError={docError}
      uploading={uploading}
      onFile={onFile}
    />
  )
}
