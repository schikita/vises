import { Global, Module } from '@nestjs/common';
import { WorkflowBusPublisherService } from './workflow-bus-publisher.service';

@Global()
@Module({
  providers: [WorkflowBusPublisherService],
  exports: [WorkflowBusPublisherService],
})
export class MessagingModule {}
