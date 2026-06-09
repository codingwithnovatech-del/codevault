import { supabase } from './supabase';
import type { Template, ComponentAsset, ApiToken, DeveloperProfile } from '../types';

// === PROFILES ===

export async function getProfile(userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return data;
}

export async function updateProfile(userId: string, updates: Partial<DeveloperProfile>) {
  const { data } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return data;
}

// === TEMPLATES ===

function mapTemplateFromDb(dbRow: any): Template {
  if (!dbRow) return dbRow;
  return { ...dbRow, lastUpdated: dbRow.last_updated || dbRow.lastUpdated || 'now' };
}

function mapTemplateToDb(tmpl: Partial<Template>): any {
  const out: any = { ...tmpl };
  if ('lastUpdated' in out) {
    out.last_updated = out.lastUpdated;
    delete out.lastUpdated;
  }
  return out;
}

export async function getTemplates() {
  const { data } = await supabase
    .from('templates')
    .select('*')
    .order('created_at', { ascending: false });
  return (data || []).map(mapTemplateFromDb) as Template[];
}

export async function createTemplate(template: Omit<Template, 'stars' | 'views' | 'lastUpdated'> & { created_by: string }) {
  const { data } = await supabase
    .from('templates')
    .insert(template)
    .select()
    .single();
  return mapTemplateFromDb(data) as Template | null;
}

export async function updateTemplate(id: string, updates: Partial<Template>) {
  const { data } = await supabase
    .from('templates')
    .update(mapTemplateToDb(updates))
    .eq('id', id)
    .select()
    .single();
  return mapTemplateFromDb(data) as Template | null;
}

export async function deleteTemplate(id: string) {
  await supabase.from('templates').delete().eq('id', id);
}

// === COMPONENTS ===

export async function getComponents() {
  const { data } = await supabase
    .from('components')
    .select('*')
    .order('created_at', { ascending: false });
  return (data || []) as ComponentAsset[];
}

export async function createComponent(component: Omit<ComponentAsset, 'id'> & { created_by: string }) {
  const { data } = await supabase
    .from('components')
    .insert(component)
    .select()
    .single();
  return data as ComponentAsset | null;
}

export async function updateComponent(id: string, updates: Partial<ComponentAsset>) {
  const { data } = await supabase
    .from('components')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return data as ComponentAsset | null;
}

export async function deleteComponent(id: string) {
  await supabase.from('components').delete().eq('id', id);
}

// === SAVED TEMPLATES ===

export async function getSavedTemplateIds(profileId: string) {
  const { data } = await supabase
    .from('saved_templates')
    .select('template_id')
    .eq('profile_id', profileId);
  return (data || []).map(r => r.template_id);
}

export async function saveTemplate(profileId: string, templateId: string) {
  await supabase
    .from('saved_templates')
    .insert({ profile_id: profileId, template_id: templateId });
}

export async function unsaveTemplate(profileId: string, templateId: string) {
  await supabase
    .from('saved_templates')
    .delete()
    .eq('profile_id', profileId)
    .eq('template_id', templateId);
}

// === SAVED COMPONENTS ===

export async function getSavedComponentIds(profileId: string) {
  const { data } = await supabase
    .from('saved_components')
    .select('component_id')
    .eq('profile_id', profileId);
  return (data || []).map(r => r.component_id);
}

export async function saveComponent(profileId: string, componentId: string) {
  await supabase
    .from('saved_components')
    .insert({ profile_id: profileId, component_id: componentId });
}

export async function unsaveComponent(profileId: string, componentId: string) {
  await supabase
    .from('saved_components')
    .delete()
    .eq('profile_id', profileId)
    .eq('component_id', componentId);
}

// === API TOKENS ===

function mapApiTokenFromDb(dbRow: any): ApiToken {
  if (!dbRow) return dbRow;
  return { id: dbRow.id, name: dbRow.name, token: dbRow.token, createdAt: dbRow.created_at || '', lastUsed: dbRow.last_used || 'Never' };
}

export async function getApiTokens(profileId: string) {
  const { data } = await supabase
    .from('api_tokens')
    .select('*')
    .eq('profile_id', profileId);
  return (data || []).map(mapApiTokenFromDb) as ApiToken[];
}

export async function createApiToken(profileId: string, name: string) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let rand = '';
  for (let i = 0; i < 22; i++) rand += chars.charAt(Math.floor(Math.random() * chars.length));
  const tokenStr = `cv_token_${rand}`;

  const { data } = await supabase
    .from('api_tokens')
    .insert({ profile_id: profileId, name, token: tokenStr })
    .select()
    .single();
  return mapApiTokenFromDb(data) as ApiToken | null;
}

export async function deleteApiToken(id: string) {
  await supabase.from('api_tokens').delete().eq('id', id);
}

// === ADMIN: USER MANAGEMENT ===

export async function getAllProfiles(): Promise<any[]> {
  const { data, error } = await supabase.rpc('get_all_profiles');
  if (!error && data) {
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') return JSON.parse(data);
    return [];
  }
  const { data: fallback } = await supabase
    .from('profiles')
    .select('id, username, email, title, bio, is_admin, is_disabled, copies_count, stars_count, created_at')
    .order('created_at', { ascending: false });
  return fallback || [];
}

export async function toggleUserDisabled(userId: string, isDisabled: boolean) {
  const { data, error } = await supabase.rpc('admin_toggle_user_disabled', { user_id: userId, disabled: isDisabled });
  if (error) {
    const { data: fallback } = await supabase
      .from('profiles')
      .update({ is_disabled: isDisabled })
      .eq('id', userId)
      .select()
      .single();
    return fallback;
  }
  return data;
}

export async function deleteUserData(userId: string) {
  const { error } = await supabase.rpc('admin_delete_user', { user_id: userId });
  if (error) {
    await supabase.from('saved_templates').delete().eq('profile_id', userId);
    await supabase.from('saved_components').delete().eq('profile_id', userId);
    await supabase.from('api_tokens').delete().eq('profile_id', userId);
    await supabase.from('profiles').delete().eq('id', userId);
  }
}

export async function getUserStats(userId: string) {
  const { data, error } = await supabase.rpc('admin_get_user_stats', { user_id: userId });
  if (!error && data) {
    if (typeof data === 'string') return JSON.parse(data);
    return data as any;
  }
  const { data: savedTemplates } = await supabase
    .from('saved_templates')
    .select('id', { count: 'exact' })
    .eq('profile_id', userId);
  const { data: savedComponents } = await supabase
    .from('saved_components')
    .select('id', { count: 'exact' })
    .eq('profile_id', userId);
  const { data: tokens } = await supabase
    .from('api_tokens')
    .select('id', { count: 'exact' })
    .eq('profile_id', userId);
  return {
    savedTemplatesCount: savedTemplates?.length || 0,
    savedComponentsCount: savedComponents?.length || 0,
    apiTokensCount: tokens?.length || 0,
  };
}

// === APP SETTINGS (global key-value, admin-managed) ===

export async function getAppSetting(key: string): Promise<any> {
  const { data } = await supabase.rpc('get_app_setting', { p_key: key });
  return data;
}

export async function setAppSetting(key: string, value: any): Promise<void> {
  await supabase.rpc('set_app_setting', { p_key: key, p_value: value });
}

// === PROFILE PREFERENCES ===

export async function getProfilePreferences(userId: string): Promise<Record<string, any>> {
  const { data } = await supabase
    .from('profiles')
    .select('preferences')
    .eq('id', userId)
    .single();
  return (data as any)?.preferences || {};
}

export async function updateProfilePreferences(userId: string, prefs: Record<string, any>): Promise<void> {
  await supabase.rpc('update_profile_preferences', { user_id: userId, prefs });
}
