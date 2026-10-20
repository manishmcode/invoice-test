export const demoMailInbox = "hearthledger@yopmail.com";

export function isDemoMailInbox(value: string): boolean {
  return value.trim().toLowerCase() === demoMailInbox;
}
