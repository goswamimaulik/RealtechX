import { endSession } from '@/lib/server/auth';
import { handle } from '@/lib/server/api';

export const runtime = 'nodejs';
export const POST = handle(async () => {
  await endSession();
  return {};
});
