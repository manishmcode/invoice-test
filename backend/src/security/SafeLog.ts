/** Log identifiers only — never SMTP passwords, tokens, or full email bodies. */
export function logInfo(event: string, meta: Record<string, string>): void {
  console.log(event, meta);
}

export function logError(event: string, error: unknown): void {
  const message = error instanceof Error ? error.message : "unknown";
  console.error(event, { message });
}

export function emailDomain(address: string): string {
  const at = address.lastIndexOf("@");
  if (at < 0) {
    return "unknown";
  }
  return address.slice(at + 1);
}
