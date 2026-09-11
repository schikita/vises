export { generateAppCode } from './generate-app-code.util';
export { mergeDocuments } from './merge-documents.util';
export { canSeeApp, assertClientOwns } from './app-authz.util';
export { extrasIn } from './app-extras.util';
export {
  applyClientPrivilegedCoerce,
  type PrivilegedAppFields,
} from './apply-client-privileged-coerce.util';
export {
  resolveUploadDir,
  ensureUploadRoot,
  writeAppDocumentFile,
  resolveAppDocumentPath,
  appDocumentExists,
  openAppDocumentStream,
} from './app-documents-fs.util';
export { deriveClientNameFromApplicants } from './derive-client-name-from-applicants.util';
export { copyPrimaryApplicantEmailIfBlank } from './copy-primary-applicant-email-if-blank.util';
