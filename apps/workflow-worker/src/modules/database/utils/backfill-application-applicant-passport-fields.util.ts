import type { DataSource } from 'typeorm';
import {
  APPLICATION_APPLICANT_DEFAULT_PASSPORT_ISSUE_COUNTRY,
  APPLICATION_APPLICANT_DEFAULT_PASSPORT_TYPE,
  APPLICATION_APPLICANT_LEGACY_PASSPORT_TYPE_MAP,
} from '../constants';

/**
 * Ensure every applicant jsonb object has portal-ready passportType /
 * passportIssueCountry (defaults + known legacy label rewrite).
 * Returns number of application rows whose applicants array changed.
 */
export const backfillApplicationApplicantPassportFields = async (
  dataSource: DataSource,
): Promise<number> => {
  const legacyCases = Object.entries(
    APPLICATION_APPLICANT_LEGACY_PASSPORT_TYPE_MAP,
  )
    .map(
      ([from, to]) =>
        `WHEN TRIM(elem->>'passportType') = '${from.replace(/'/g, "''")}' THEN '${to.replace(/'/g, "''")}'`,
    )
    .join('\n                     ');

  const updatedIds: Array<{ id: string }> = await dataSource.query(
    `
    UPDATE applications AS a
    SET
      applicants = sub.new_applicants,
      updated_at = NOW()
    FROM (
      SELECT
        id,
        COALESCE(
          (
            SELECT jsonb_agg(
              CASE
                WHEN jsonb_typeof(elem) <> 'object' THEN elem
                ELSE
                  elem
                  || jsonb_build_object(
                       'passportIssueCountry',
                       COALESCE(
                         NULLIF(TRIM(elem->>'passportIssueCountry'), ''),
                         '${APPLICATION_APPLICANT_DEFAULT_PASSPORT_ISSUE_COUNTRY}'
                       )
                     )
                  || jsonb_build_object(
                       'passportType',
                       CASE
                         WHEN NULLIF(TRIM(elem->>'passportType'), '') IS NULL
                           THEN '${APPLICATION_APPLICANT_DEFAULT_PASSPORT_TYPE}'
                         ${legacyCases}
                         ELSE TRIM(elem->>'passportType')
                       END
                     )
              END
              ORDER BY ordinality
            )
            FROM jsonb_array_elements(
              CASE
                WHEN jsonb_typeof(applicants) = 'array' THEN applicants
                ELSE '[]'::jsonb
              END
            ) WITH ORDINALITY AS t(elem, ordinality)
          ),
          '[]'::jsonb
        ) AS new_applicants
      FROM applications
    ) AS sub
    WHERE a.id = sub.id
      AND a.applicants IS DISTINCT FROM sub.new_applicants
    RETURNING a.id
    `,
  );

  return Array.isArray(updatedIds) ? updatedIds.length : 0;
};
