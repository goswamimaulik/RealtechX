import { requireUser, logActivity, HttpError } from '@/lib/server/auth';
import { handle, body } from '@/lib/server/api';
import { cloudinaryConfig, signParams, destroyAsset } from '@/lib/server/cloudinary';
import { slugify } from '@/lib/server/util';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST { folder }                 → signature for a direct browser → Cloudinary upload
 * POST { action:'destroy', id }   → deletes a media item (and the Cloudinary file)
 */
export const POST = handle(async (req: Request) => {
  const { db, user } = await requireUser('media');
  const b = await body<{ folder?: string; action?: string; id?: string }>(req);
  const cfg = await cloudinaryConfig(db);

  if (b.action === 'destroy') {
    const item = await db.coll('media').findOne({ _id: String(b.id || '') });
    if (!item) return { deleted: 0 };
    if (item.publicId && cfg) await destroyAsset(cfg, item.publicId, item.resourceType).catch(() => false);
    await db.coll('media').deleteOne({ _id: item._id });
    await logActivity(db, user, 'delete', 'media', item._id, item.name);
    return { deleted: 1 };
  }

  if (!cfg) throw new HttpError(422, 'Image uploads need Cloudinary (free). Add your Cloudinary keys in Settings → Media & uploads, or paste an image URL instead.');
  const settings = await db.coll('settings').findOne({ _id: 'site' });
  const folder = `realtechx/${slugify(b.folder || 'general') || 'general'}`;
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { folder, timestamp };
  return {
    cloudName: cfg.cloudName,
    apiKey: cfg.apiKey,
    timestamp,
    folder,
    signature: signParams(params, cfg.apiSecret),
    maxMb: Number(settings?.uploads?.maxMb) || 8,
    types: String(settings?.uploads?.types || 'jpg,jpeg,png,webp,avif,pdf,mp4'),
  };
});
