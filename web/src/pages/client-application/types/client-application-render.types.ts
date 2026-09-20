import type { Application, DocType } from '@/entities/application'

export type ClientApplicationRenderProps = {
  app: Application | undefined
  docError: string
  uploading: DocType | null
  onFile: (type: DocType, file: File) => void
}
