export const AsyncStatus = {
  Init: 'init',
  Pending: 'pending',
  Success: 'success',
  Error: 'error',
} as const;

export type AsyncStatus = typeof AsyncStatus[keyof typeof AsyncStatus];
