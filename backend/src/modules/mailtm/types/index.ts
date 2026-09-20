export type {
  MailTmAccountHandle,
  FetchMailTmJsonInput,
  FetchMailTmJsonResult,
  MailTmDomainMember,
  MailTmHydraCollection,
  MailTmMessageSummary,
  MailTmMessagesCollection,
  MailTmMessageDetail,
  CreateMailTmAccountResult,
  WaitMailTmLatestMessageInput,
  WaitMailTmLatestMessageResult,
  ExtractMailTmOtpInput,
  ExtractMailTmOtpResult,
  DeleteMailTmAccountInput,
  DeleteMailTmAccountResult,
} from './mailtm.types';
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
  MailTmCircuitCallOptions,
} from './mailtm-circuit.types';
