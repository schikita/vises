import type { PortalStatusFieldProgress } from '../types/portal-status-checkpoint.types';
import { clonePortalStatusFieldProgress } from './clone-portal-status-field-progress.util';

const withoutFieldId = (
  progress: PortalStatusFieldProgress,
  fieldId: string,
): PortalStatusFieldProgress => ({
  filled: progress.filled.filter((id) => id !== fieldId),
  skipped: progress.skipped.filter((id) => id !== fieldId),
  failed: progress.failed.filter((entry) => entry.fieldId !== fieldId),
});

export const recordEditMemberFieldFilled = (
  progress: PortalStatusFieldProgress,
  fieldId: string,
): PortalStatusFieldProgress => {
  const next = withoutFieldId(progress, fieldId);
  next.filled.push(fieldId);
  return next;
};

export const recordEditMemberFieldSkipped = (
  progress: PortalStatusFieldProgress,
  fieldId: string,
): PortalStatusFieldProgress => {
  const next = withoutFieldId(progress, fieldId);
  next.skipped.push(fieldId);
  return next;
};

export const recordEditMemberFieldFailed = (
  progress: PortalStatusFieldProgress,
  fieldId: string,
  reasonCode: string,
): PortalStatusFieldProgress => {
  const next = withoutFieldId(progress, fieldId);
  next.failed.push({ fieldId, reasonCode });
  return next;
};

export const seedEditMemberFieldProgress = (
  prior: PortalStatusFieldProgress | null | undefined,
): PortalStatusFieldProgress => {
  if (!prior) {
    return { filled: [], skipped: [], failed: [] };
  }
  return clonePortalStatusFieldProgress(prior);
};
