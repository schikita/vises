import assert from 'node:assert/strict';
import { BLS_APPLICANT_PORTAL_STATUS } from '../constants/bls-applicant-portal-status.constants';
import { PORTAL_STATUS_MEMBER_BRANCH } from '../constants/portal-status-member-branch.constants';
import type { PortalApplicantStatusRow } from '../types/portal-status.types';
import { isPortalStatusAddFamilyMemberClickAllowed } from './is-portal-status-add-family-member-click-allowed.util';
import { resolvePortalStatusAddResumeSkip } from './resolve-portal-status-add-resume-skip.util';
import { resolvePortalStatusMemberOpenPath } from './resolve-portal-status-member-open-path.util';

/**
 * MA-TASK-009 open-path / Add gate / resume live-evidence unit checks.
 * Run: npx --yes tsx src/modules/portal-fill/utils/resolve-portal-status-member-open-path.util.spec.ts
 */

const row = (
  partial: Partial<PortalApplicantStatusRow> &
    Pick<PortalApplicantStatusRow, 'rowIndex' | 'nameText'>,
): PortalApplicantStatusRow => ({
  statusRaw: 'Form Filling In-Progress',
  status: BLS_APPLICANT_PORTAL_STATUS.FORM_FILLING_IN_PROGRESS,
  portalApplicantId: null,
  hasEditAction: true,
  ...partial,
});

assert.equal(
  isPortalStatusAddFamilyMemberClickAllowed({
    shouldAddFamilyMembers: false,
  }),
  false,
  'no pre-start extras → never allow Add click',
);

assert.equal(
  isPortalStatusAddFamilyMemberClickAllowed({
    shouldAddFamilyMembers: true,
    phaseBEnabled: false,
  }),
  false,
  'Phase B off → never allow Add click',
);

assert.equal(
  isPortalStatusAddFamilyMemberClickAllowed({
    shouldAddFamilyMembers: true,
    phaseBEnabled: true,
  }),
  true,
  'pre-start extras + Phase B → allow Add click',
);

const primaryEdit = resolvePortalStatusMemberOpenPath({
  currentApplicantId: 'primary',
  applicationPrimaryApplicantId: 'primary',
  shouldAddFamilyMembers: true,
  addClickAllowed: true,
  pendingPortalAdd: true,
  nameMatchedRow: row({ rowIndex: 0, nameText: 'Ada Primary' }),
  statusMatchedRow: row({ rowIndex: 0, nameText: 'Ada Primary' }),
});
assert.equal(primaryEdit.mode, 'EDIT_EXISTING');
assert.equal(
  primaryEdit.memberBranch,
  PORTAL_STATUS_MEMBER_BRANCH.EDIT_EXISTING,
);

const addPending = resolvePortalStatusMemberOpenPath({
  currentApplicantId: 'extra',
  applicationPrimaryApplicantId: 'primary',
  shouldAddFamilyMembers: true,
  addClickAllowed: true,
  pendingPortalAdd: true,
  nameMatchedRow: null,
  statusMatchedRow: row({ rowIndex: 0, nameText: 'Ada Primary' }),
});
assert.equal(addPending.mode, 'ADD_NEW_MEMBER');
assert.equal(
  addPending.memberBranch,
  PORTAL_STATUS_MEMBER_BRANCH.ADD_NEW_MEMBER,
);

const noExtrasNoop = resolvePortalStatusMemberOpenPath({
  currentApplicantId: 'solo',
  applicationPrimaryApplicantId: 'solo',
  shouldAddFamilyMembers: false,
  addClickAllowed: false,
  pendingPortalAdd: false,
  nameMatchedRow: null,
  statusMatchedRow: null,
});
assert.equal(noExtrasNoop.mode, 'NONE');
assert.equal(noExtrasNoop.memberBranch, undefined);

const blockedExtra = resolvePortalStatusMemberOpenPath({
  currentApplicantId: 'extra',
  applicationPrimaryApplicantId: 'primary',
  shouldAddFamilyMembers: true,
  addClickAllowed: false,
  pendingPortalAdd: true,
  nameMatchedRow: null,
  statusMatchedRow: null,
});
assert.equal(blockedExtra.mode, 'NONE');

const checkpointOnlySkip = resolvePortalStatusAddResumeSkip({
  checkpointPastOpenAddMember: true,
  liveVisaModalVisible: false,
  liveEditFrameReady: false,
  liveEditFormVisible: false,
});
assert.equal(
  checkpointOnlySkip.skipAddClick,
  false,
  'checkpoint past OPEN_ADD_MEMBER without live form must not skip Add',
);
assert.equal(checkpointOnlySkip.treatAsFormOpened, false);
assert.equal(
  checkpointOnlySkip.reason,
  'checkpoint_past_open_add_without_live_form',
);

const liveModalSkip = resolvePortalStatusAddResumeSkip({
  checkpointPastOpenAddMember: true,
  liveVisaModalVisible: true,
  liveEditFrameReady: false,
  liveEditFormVisible: false,
});
assert.equal(
  liveModalSkip.skipAddClick,
  true,
  'live visa modal may skip Add re-click',
);
assert.equal(liveModalSkip.treatAsFormOpened, true);
assert.equal(liveModalSkip.reason, 'live_member_form_path_open');

const liveFrameSkip = resolvePortalStatusAddResumeSkip({
  checkpointPastOpenAddMember: false,
  liveVisaModalVisible: false,
  liveEditFrameReady: true,
  liveEditFormVisible: false,
});
assert.equal(
  liveFrameSkip.skipAddClick,
  true,
  'live edit frame ready may skip Add re-click',
);

const liveFormSkip = resolvePortalStatusAddResumeSkip({
  checkpointPastOpenAddMember: false,
  liveVisaModalVisible: false,
  liveEditFrameReady: false,
  liveEditFormVisible: true,
});
assert.equal(
  liveFormSkip.skipAddClick,
  true,
  'live edit form visible may skip Add re-click',
);

const freshAdd = resolvePortalStatusAddResumeSkip({
  checkpointPastOpenAddMember: false,
  liveVisaModalVisible: false,
  liveEditFrameReady: false,
  liveEditFormVisible: false,
});
assert.equal(freshAdd.skipAddClick, false);
assert.equal(freshAdd.reason, 'no_live_form_reclick_add');

console.log('resolve-portal-status-member-open-path.util.spec.ts: ok');
