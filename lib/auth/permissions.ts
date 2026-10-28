import type { Role } from '../types';

export type Perm =
  | 'dashboard'
  | 'properties'
  | 'leads'
  | 'locations'
  | 'taxonomy'
  | 'developers'
  | 'content'
  | 'blogs'
  | 'seo'
  | 'media'
  | 'settings'
  | 'users'
  | 'activity'
  | 'backup';

export const roleLabels: Record<Role, string> = {
  super_admin: 'Super Admin',
  property_manager: 'Property Manager',
  content_editor: 'Content Editor',
  lead_manager: 'Lead Manager',
};

export const roleDescriptions: Record<Role, string> = {
  super_admin: 'Full access to everything, including settings, users, backups and the activity log.',
  property_manager: 'Properties, projects, locations, categories, developers and media.',
  content_editor: 'Pages & content, blogs, SEO and the media library.',
  lead_manager: 'Leads & enquiries — CRM, follow-ups, notes and exports.',
};

const matrix: Record<Role, Perm[]> = {
  super_admin: ['dashboard', 'properties', 'leads', 'locations', 'taxonomy', 'developers', 'content', 'blogs', 'seo', 'media', 'settings', 'users', 'activity', 'backup'],
  property_manager: ['dashboard', 'properties', 'locations', 'taxonomy', 'developers', 'media'],
  content_editor: ['dashboard', 'content', 'blogs', 'seo', 'media'],
  lead_manager: ['dashboard', 'leads'],
};

export const can = (role: string | undefined, perm: Perm) => !!role && (matrix[role as Role] ?? []).includes(perm);
export const permsOf = (role: string) => matrix[role as Role] ?? [];
export const roles = Object.keys(matrix) as Role[];
