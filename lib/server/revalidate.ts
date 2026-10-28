import { revalidatePath } from 'next/cache';
import { invalidateStore } from './store';

/** Call after any admin change that affects the public website. */
export function refreshSite() {
  invalidateStore();
  try {
    revalidatePath('/', 'layout');
  } catch (e) {
    console.warn('[revalidate] skipped', e);
  }
}
