/** Client ↔ application join via ClientDetailDto.applicationId === AppOut.id. */
export type ClientApplicationJoin = {
  applicationId: string
  clientId: string
  firstName: string | null
  lastName: string | null
}
