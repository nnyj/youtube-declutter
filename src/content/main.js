// Runtime loop: loads settings, applies every feature, reapplies on storage changes, DOM changes and SPA navigation.
(() => {
  const NAV_EVENTS = ['popstate', 'pageshow', 'spfdone', 'yt-navigate-finish', 'yt-page-data-updated', 'yt-page-type-changed'];
  const APPLY_DELAY_MS = 50;
  // The player renders late, so autoplay enforcement gets a few extra passes after load.
  const LOAD_RETRY_MS = [250, 500, 1000, 1500, 2000];
  const BASE_CSS = yd.css_hide([`[${yd.HIDDEN_ATTR}]`]);

  let raw_settings = {};
  let loaded = false;
  let stopped = false;
  let apply_timer = 0;
  const observer = new MutationObserver(apply_soon);

  function runtime_alive() {
    try {
      return Boolean(yd.api.runtime?.id);
    } catch {
      return false;
    }
  }

  // After an extension reload this script has no runtime left, so it goes quiet.
  function stop() {
    stopped = true;
    observer.disconnect();
    clearTimeout(apply_timer);
    for (const type of NAV_EVENTS) window.removeEventListener(type, apply_soon, true);
  }

  function apply() {
    clearTimeout(apply_timer);
    apply_timer = 0;
    if (stopped || !loaded) return;
    if (!runtime_alive()) {
      stop();
      return;
    }
    const s = yd.settings_effective(raw_settings);
    for (const feature of yd.features) feature.sync?.(s);
    const css = yd.features.map((feature) => feature.css?.(s) ?? '').join('');
    yd.style_set(s.enabled ? BASE_CSS + css : '');
    yd.hidden_sync(yd.features.flatMap((feature) => feature.hide?.(s) ?? []));
  }

  function apply_soon() {
    if (!apply_timer && !stopped) apply_timer = setTimeout(apply, APPLY_DELAY_MS);
  }

  async function settings_load() {
    try {
      raw_settings = await yd.api.storage.sync.get(null);
      if (Object.keys(raw_settings).length === 0) await yd.api.storage.sync.set(yd.DEFAULTS);
    } catch {
      raw_settings = {};
    }
    loaded = true;
    apply();
    for (const delay of LOAD_RETRY_MS) setTimeout(apply_soon, delay);
  }

  yd.api.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync' || stopped) return;
    for (const [key, change] of Object.entries(changes)) {
      if ('newValue' in change) raw_settings[key] = change.newValue;
      else delete raw_settings[key];
    }
    apply();
  });

  // Capture phase on window sees these events whether or not they bubble.
  for (const type of NAV_EVENTS) window.addEventListener(type, apply_soon, true);
  // Observing <html> instead of <body> covers document_start, before <body> exists.
  observer.observe(document.documentElement, { childList: true, subtree: true });
  settings_load();
})();
