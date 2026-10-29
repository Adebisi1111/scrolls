export type ArticleMeta = {
  id: number
  doc_id: number
  title: string
  author_name: string
  author_wallet: string
  abstract: string
  file_name: string | null
  created_at: string
}

export type ArticleFull = ArticleMeta & {
  body: string
  has_file: boolean
}

/** Reserve the next doc_id without saving anything yet. */
export async function reserveDocId(): Promise<number> {
  const res = await fetch('/api/next-doc-id')
  if (!res.ok) throw new Error('Failed to reserve doc ID')
  const data = (await res.json()) as { doc_id: number }
  return data.doc_id
}

export async function publishArticle(data: {
  doc_id: number
  title: string
  author_name: string
  author_wallet: string
  abstract: string
  body: string
  file?: File | null
}): Promise<ArticleFull> {
  const res = await fetch('/api/articles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      doc_id: data.doc_id,
      title: data.title,
      author_name: data.author_name,
      author_wallet: data.author_wallet,
      abstract: data.abstract,
      body: data.body,
    }),
  })
  if (!res.ok) {
    const e = (await res.json().catch(() => ({ error: 'Unknown error' }))) as { error: string }
    throw new Error(e.error ?? 'Failed to publish')
  }
  return res.json() as Promise<ArticleFull>
}

export async function fetchArticle(docId: number): Promise<ArticleFull> {
  const res = await fetch(`/api/articles/${docId}`)
  if (!res.ok) {
    if (res.status === 404) throw new Error('Article not found')
    throw new Error('Failed to load article')
  }
  return res.json() as Promise<ArticleFull>
}

export async function listArticles(): Promise<ArticleMeta[]> {
  const res = await fetch('/api/articles')
  if (!res.ok) throw new Error('Failed to load articles')
  return res.json() as Promise<ArticleMeta[]>
}

/** Build the gated file download URL — only works after on-chain unlock */
export function gatedFileUrl(docId: number, readerAddress: string): string {
  return `/api/files/${docId}?reader=${readerAddress}`
}
