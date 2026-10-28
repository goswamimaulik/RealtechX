import { createHash } from 'node:crypto';
import type { Db } from './db';

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  fromEnv: boolean;
}

export async function cloudinaryConfig(db: Db): Promise<CloudinaryConfig | null> {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_URL } = process.env;
  if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
    return { cloudName: CLOUDINARY_CLOUD_NAME, apiKey: CLOUDINARY_API_KEY, apiSecret: CLOUDINARY_API_SECRET, fromEnv: true };
  }
  // cloudinary://<key>:<secret>@<cloud>
  const m = CLOUDINARY_URL?.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
  if (m) return { apiKey: m[1], apiSecret: m[2], cloudName: m[3], fromEnv: true };
  const sec = await db.coll('secrets').findOne({ _id: 'cloudinary' }).catch(() => null);
  if (sec?.cloudName && sec?.apiKey && sec?.apiSecret) return { cloudName: sec.cloudName, apiKey: sec.apiKey, apiSecret: sec.apiSecret, fromEnv: false };
  return null;
}

/** Cloudinary signature: sha1 of sorted params + secret. */
export function signParams(params: Record<string, string | number>, secret: string) {
  const toSign = Object.keys(params)
    .filter((k) => params[k] !== '' && params[k] !== undefined)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return createHash('sha1').update(toSign + secret).digest('hex');
}

export async function destroyAsset(cfg: CloudinaryConfig, publicId: string, resourceType: string) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signParams({ public_id: publicId, timestamp }, cfg.apiSecret);
  const fd = new FormData();
  fd.set('public_id', publicId);
  fd.set('timestamp', String(timestamp));
  fd.set('api_key', cfg.apiKey);
  fd.set('signature', signature);
  const type = ['image', 'video', 'raw'].includes(resourceType) ? resourceType : 'image';
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cfg.cloudName}/${type}/destroy`, { method: 'POST', body: fd });
  return res.ok;
}
