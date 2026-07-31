/**
 * Shared id builders so a tab and the panel it controls can reference each
 * other. Kept out of `Tabs.tsx` because a module that exports both components
 * and plain functions breaks fast refresh.
 */

/** Id of the tab button for `key`. */
export function tabId(prefix: string, key: string): string {
  return `${prefix}-tab-${key}`
}

/** Id of the panel controlled by the tab for `key`. */
export function tabPanelId(prefix: string, key: string): string {
  return `${prefix}-panel-${key}`
}
