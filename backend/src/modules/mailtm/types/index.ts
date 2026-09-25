export type {
  MailTmAccountHandle,
  FetchMailTmJsonInput,
  FetchMailTmJsonResult,
  MailTmDomainMember,
  MailTmHydraCollection,
  MailTmMessageSummary,
  MailTmMessagesCollection,
  MailTmMessageDetail,
  LoginMailTmAccountInput,
  ResolveMailTmAccountResult,
} from './mailtm.types';
export type {
  TemporaryMailboxAccount,
  CreateTemporaryMailboxInput,
  TemporaryEmailCallOptions,
  WaitTemporaryEmailMessageInput,
  WaitTemporaryEmailMessageResult,
  ExtractTemporaryEmailOtpInput,
  ExtractTemporaryEmailOtpResult,
  ExtractTemporaryEmailPortalPasswordInput,
  ExtractTemporaryEmailPortalPasswordResult,
  DeleteTemporaryMailboxInput,
  DeleteTemporaryMailboxResult,
} from './temporary-email.types';
export type {
  MailTmFailureClass,
  MailTmFailureClassifyInput,
  CreateMailTmClientErrorInput,
  MailTmClientError,
} from './mailtm-failure.types';
export type {
  MailTmCircuitState,
  MailTmCircuitBreaker,
  MailTmCircuitRecordFailureResult,
} from './mailtm-circuit.types';
