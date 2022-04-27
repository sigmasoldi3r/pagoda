import { none, option, some } from '@octantis/option'
import lock from './Dialog/LockDialog'

export interface FileUploadSettings {
  multiple: boolean
  directory: boolean
}

/**
 * Asks the user for files.
 */
export default function uploadFile(options?: Partial<FileUploadSettings>) {
  const dom = document.createElement('input')
  dom.type = 'file'
  dom.name = 'files[]'
  if (options?.directory) {
    dom.webkitdirectory = true
  }
  document.body.appendChild(dom)
  const [done] = lock('Uploading files...')
  return new Promise<
    option<typeof options extends { directory: true } ? FileList : FileList>
  >(r => {
    dom.onchange = e => {
      document.body.removeChild(dom)
      const t = e.target as any
      done()
      if (t?.files) {
        r(some(t.files))
      } else {
        r(none())
      }
    }
    dom.click()
  })
}
