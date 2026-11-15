import { Client } from '../../database/entities/client.entity';
import type { BuildNewClientRowInput } from '../types/build-new-client-row.types';

/**
 * Blank CRM Client row for create + debit (no Application required).
 * Passport / portal-form columns stay null until later PATCH paths.
 */
export const buildNewClientRow = (input: BuildNewClientRowInput): Client => {
  const client = new Client();
  client.id = input.id;
  client.agentId = input.agentId;
  client.email = input.email ?? null;
  client.phone = input.phone ?? null;
  client.address = input.address ?? null;
  client.purpose = input.purpose ?? null;
  client.firstEntry = input.firstEntry ?? null;
  client.entries = input.entries ?? null;
  client.durationDays = input.durationDays ?? null;
  client.relationship = input.relationship ?? null;
  client.passportNumber = null;
  client.passportIssued = null;
  client.passportExpires = null;
  client.passportType = null;
  client.passportIssueCountry = null;
  client.passportIssuedBy = null;
  client.firstName = null;
  client.lastName = null;
  client.lastNameAtBirth = null;
  client.dob = null;
  client.placeOfBirth = null;
  client.countryOfBirth = null;
  client.nationality = null;
  client.nationalityAtBirth = null;
  client.nationalId = null;
  client.otherNames = null;
  client.gender = null;
  client.maritalStatus = null;
  client.createdAt = input.now;
  client.updatedAt = input.now;
  return client;
};
