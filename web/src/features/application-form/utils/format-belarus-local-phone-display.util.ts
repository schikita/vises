/** Format up to 9 local BY digits as `(29) 123-45-67` for display chrome. */
export const formatBelarusLocalPhoneDisplay = (digits: string): string => {
  const d = digits.replace(/\D/g, '').slice(0, 9)
  if (!d) return ''
  if (d.length <= 2) return `(${d}`
  if (d.length <= 5) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2, 5)}-${d.slice(5)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 5)}-${d.slice(5, 7)}-${d.slice(7)}`
}
