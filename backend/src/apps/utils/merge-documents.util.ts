import type { DocMeta } from '../types';

/**
 * DEC-004 / REQ-012: never trust client `stored`; empty/omitted body docs
 * preserve server list; non-empty merges by id (server docs always kept).
 */
export const mergeDocuments = (
  existing: DocMeta[],
  bodyDocs: unknown[] | undefined,
): DocMeta[] => {
  const server = Array.isArray(existing) ? [...existing] : [];
  if (
    bodyDocs === undefined ||
    !Array.isArray(bodyDocs) ||
    bodyDocs.length === 0
  ) {
    return server;
  }

  const byId = new Map<string, number>();
  server.forEach((d, i) => {
    if (d?.id) byId.set(d.id, i);
  });

  for (const raw of bodyDocs) {
    if (!raw || typeof raw !== 'object') continue;
    const d = raw as Record<string, unknown>;
    const id = typeof d.id === 'string' ? d.id : '';
    if (!id) continue;

    const idx = byId.get(id);
    if (idx !== undefined) {
      const prev = server[idx];
      server[idx] = {
        id: prev.id,
        type: typeof d.type === 'string' ? d.type : prev.type,
        name: typeof d.name === 'string' ? d.name : prev.name,
        uploadedAt:
          typeof d.uploadedAt === 'string' ? d.uploadedAt : prev.uploadedAt,
        stored: prev.stored,
      };
    } else {
      server.push({
        id,
        type: typeof d.type === 'string' ? d.type : '',
        name: typeof d.name === 'string' ? d.name : '',
        stored: '',
        uploadedAt: typeof d.uploadedAt === 'string' ? d.uploadedAt : '',
      });
      byId.set(id, server.length - 1);
    }
  }

  return server;
};
