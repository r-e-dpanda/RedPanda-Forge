// src/lib/assetResolver.ts

/**
 * Enterprise Bundle System - Runtime Asset Path Resolver
 * 
 * Maps resource prefixes (@global/, @shared/, @local/, @system/) to their physical
 * paths based on the actively executing template context.
 */

export interface ResolverContext {
  packId: string;
  templateId: string;
  assetRoot?: string;
  templateRoot?: string;
}

export function resolveAssetPath(src: string, context: ResolverContext): string {
  if (!src) return src;
  
  // If it's a URL or base64, return immediately
  if (src.startsWith('http') || src.startsWith('data:image')) {
    return src;
  }

  // Set default configurable roots
  const ASSET_ROOT = context.assetRoot || '/assets';
  const TEMPLATE_ROOT = context.templateRoot || '/templates';
  
  const ctxPack = context.packId || '_default_pack';
  const ctxTemplate = context.templateId || 'fallback';

  if (src.startsWith('@global/')) {
    // -> /assets/...
    return src.replace('@global/', `${ASSET_ROOT}/`);
  }

  if (src.startsWith('@shared/')) {
    // -> /templates/{packId}/shared_assets/...
    return src.replace('@shared/', `${TEMPLATE_ROOT}/${ctxPack}/shared_assets/`);
  }

  if (src.startsWith('@local/')) {
    // -> /templates/{packId}/templates/{templateId}/local_assets/...
    return src.replace('@local/', `${TEMPLATE_ROOT}/${ctxPack}/templates/${ctxTemplate}/local_assets/`);
  }

  if (src.startsWith('@system/')) {
    // System placeholders -> /_system/
    return src.replace('@system/', `${ASSET_ROOT}/_system/`);
  }

  // Fallback: If no prefix, assume absolute or handle gracefully.
  return src;
}
