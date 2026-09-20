/** Basic email shape check for staff client identity (REQ-019). */
export const isValidEmailFormat = (raw: string): boolean => {
  const value = raw.trim()
  if (!value) return false
  // Practical RFC 5321-inspired check: local@domain with a dotted host label.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}
