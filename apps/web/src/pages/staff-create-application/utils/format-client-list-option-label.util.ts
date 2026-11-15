import type { ClientListDto } from '@/entities/client'

/** Display label for Client picker — masked passport only (no FR-6 plaintext). */
export const formatClientListOptionLabel = (client: ClientListDto): string => {
  const name = `${client.firstName} ${client.lastName}`.trim() || client.id
  const mask = client.maskedPassport.trim()
  return mask ? `${name} · ${mask}` : name
}
