export const mockDelay = (ms: number = 400): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
