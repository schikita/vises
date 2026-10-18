import { Module } from '@nestjs/common';
import { BlsWorkflowModule } from '../bls-workflow';
import { WorkflowBusConsumerService } from './workflow-bus-consumer.service';

@Module({
  imports: [BlsWorkflowModule],
  providers: [WorkflowBusConsumerService],
})
export class MessagingModule {}
