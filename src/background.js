// Keeps the homepage -> Subscriptions network redirect rule in sync with settings.
const api = globalThis.browser ?? globalThis.chrome;

const REDIRECT_RULE_ID = 1;
const RULE_KEYS = ['extensionEnabled', 'hideFeed', 'redirectToSubs'];

const redirect_rule = {
  id: REDIRECT_RULE_ID,
  priority: 1,
  action: { type: 'redirect', redirect: { url: 'https://www.youtube.com/feed/subscriptions' } },
  condition: {
    // Bare homepage only: optional trailing slash, optional query string.
    regexFilter: '^https?://(www\\.)?youtube\\.com/?(\\?.*)?$',
    resourceTypes: ['main_frame']
  }
};

async function redirect_rule_sync() {
  let stored = {};
  try {
    stored = await api.storage.sync.get(RULE_KEYS);
  } catch {
    // Read failure -> defaults, which leave the rule off.
  }
  const enabled = Boolean(stored.extensionEnabled ?? true) && Boolean(stored.hideFeed) && Boolean(stored.redirectToSubs);
  try {
    await api.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [REDIRECT_RULE_ID],
      addRules: enabled ? [redirect_rule] : []
    });
  } catch (error) {
    console.error('YouTube Declutter: redirect rule update failed', error);
  }
}

api.runtime.onInstalled.addListener(redirect_rule_sync);
api.runtime.onStartup.addListener(redirect_rule_sync);
api.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && RULE_KEYS.some((key) => key in changes)) redirect_rule_sync();
});
