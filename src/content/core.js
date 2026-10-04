// Shared settings model, page checks and hiding helpers used by every isolated-world content script.
globalThis.yd = (() => {
  const api = globalThis.browser ?? globalThis.chrome;

  const DEFAULTS = {
    extensionEnabled: true,
    hideFeed: false,
    redirectToSubs: false,
    hideShortsHomepage: false,
    hideExploreMoreTopics: false,
    cleanHomepageFeed: false,
    hideCommunityPosts: false,
    hideFeaturedContent: false,
    hideMembersOnly: false,
    hidePlayables: false,
    hideMostRelevantSubscriptions: false,
    hideSubsLiveStreams: false,
    hideShortsGlobally: false,
    redirectShorts: false,
    hideVideoThumbnails: false,
    hideSidebar: false,
    hideRecommended: false,
    hideSidebarShorts: false,
    hidePlaylists: false,
    hideComments: false,
    hideLiveChat: false,
    hideEndCards: false,
    disableAutoplay: false,
    disablePlaylistAutoplay: false,
    disableRegularAutoplay: false,
    hideSearchRecommended: false,
    hideShortsSearch: false,
    cleanSidebar: false,
    hideSubscriptions: false,
    hideExplore: false,
    hideMoreFromYT: false
  };

  const THUMBNAIL_MODES = ['off', 'hidden', 'reveal-on-hover', 'blurred', 'solid-color'];

  // Resolves power switch, parent keys and Shorts precedence into the flags features act on.
  function settings_effective(raw) {
    const stored = (key) => Boolean(raw[key] ?? DEFAULTS[key]);
    const enabled = stored('extensionEnabled');
    const on = (key, parent) => enabled && (stored(key) || (parent !== undefined && stored(parent)));
    const shorts_global = on('hideShortsGlobally');
    const hide_sidebar = on('hideSidebar');
    const hide_recommended = on('hideRecommended', 'hideSidebar');
    const thumbnail_mode = THUMBNAIL_MODES.includes(raw.hideVideoThumbnails) ? raw.hideVideoThumbnails : 'off';
    return {
      enabled,
      hideFeed: on('hideFeed'),
      redirectToSubs: on('hideFeed') && on('redirectToSubs'),
      hideShortsHomepage: !shorts_global && on('hideShortsHomepage'),
      hideExploreMoreTopics: on('hideExploreMoreTopics'),
      hideCommunityPosts: on('hideCommunityPosts', 'cleanHomepageFeed'),
      hideFeaturedContent: on('hideFeaturedContent', 'cleanHomepageFeed'),
      hideMembersOnly: on('hideMembersOnly', 'cleanHomepageFeed'),
      hidePlayables: on('hidePlayables', 'cleanHomepageFeed'),
      hideMostRelevantSubscriptions: on('hideMostRelevantSubscriptions'),
      hideSubsLiveStreams: on('hideSubsLiveStreams'),
      hideShortsGlobally: shorts_global,
      redirectShorts: on('redirectShorts'),
      thumbnails: enabled ? thumbnail_mode : 'off',
      hideSidebar: hide_sidebar,
      hideRecommended: hide_recommended,
      hideSidebarShorts: on('hideSidebarShorts', 'hideSidebar'),
      hidePlaylists: on('hidePlaylists', 'hideSidebar'),
      hideComments: on('hideComments'),
      hideLiveChat: on('hideLiveChat'),
      hideEndCards: on('hideEndCards') || hide_recommended || hide_sidebar,
      disableAutoplay: on('disableAutoplay'),
      disablePlaylistAutoplay: on('disablePlaylistAutoplay', 'disableAutoplay'),
      disableRegularAutoplay: on('disableRegularAutoplay', 'disableAutoplay'),
      hideSearchRecommended: on('hideSearchRecommended'),
      hideShortsSearch: !shorts_global && on('hideShortsSearch'),
      hideSubscriptions: on('hideSubscriptions', 'cleanSidebar'),
      hideExplore: on('hideExplore', 'cleanSidebar'),
      hideMoreFromYT: on('hideMoreFromYT', 'cleanSidebar'),
      home_tab: enabled && (stored('hideFeed') || stored('redirectToSubs')),
      shorts_tab: enabled && ['hideShortsGlobally', 'hideShortsHomepage', 'hideShortsSearch', 'redirectShorts'].some(stored)
    };
  }

  // Page checks read the URL at call time, so they follow SPA navigation.
  const page = {
    is_home: () => ['/', '/home'].includes(location.pathname.replace(/\/+$/, '') || '/'),
    is_subscriptions: () => location.pathname.startsWith('/feed/subscriptions'),
    is_watch: () => location.href.includes('/watch'),
    has_list: () => new URLSearchParams(location.search).has('list')
  };

  const SHORTS_LINK = '[href^="/shorts/"]';
  const SHORTS_BADGE = 'ytd-thumbnail-overlay-time-status-renderer[overlay-style="SHORTS"]';
  const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
  const HIDE = 'display: none !important;';
  const HIDDEN_ATTR = 'data-yd-hidden';

  function css_rule(selectors, declarations) {
    return selectors.length ? `${selectors.join(',\n')} {\n  ${declarations}\n}\n` : '';
  }

  function css_hide(selectors) {
    return css_rule(selectors, HIDE);
  }

  let style_el = null;

  // Empty text removes the stylesheet, unchanged text skips the rewrite.
  function style_set(text) {
    if (!text) {
      style_el?.remove();
      style_el = null;
      return;
    }
    if (!style_el) {
      style_el = document.createElement('style');
      style_el.id = 'yd-style';
    }
    if (style_el.textContent !== text) style_el.textContent = text;
    if (!style_el.isConnected) (document.head ?? document.documentElement).append(style_el);
  }

  // Marks exactly the given elements as hidden, unmarking anything no longer wanted.
  function hidden_sync(elements) {
    const wanted = new Set(elements);
    for (const el of document.querySelectorAll(`[${HIDDEN_ATTR}]`)) {
      if (!wanted.has(el)) el.removeAttribute(HIDDEN_ATTR);
    }
    for (const el of wanted) {
      if (!el.hasAttribute(HIDDEN_ATTR)) el.setAttribute(HIDDEN_ATTR, '');
    }
  }

  // Returns a switch for a capture-phase click listener; resolve_url(target) gives the replacement URL or null.
  function click_redirect(resolve_url) {
    let active = false;
    const on_click = (event) => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const url = resolve_url(event.target);
      if (!url) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      location.assign(url);
    };
    return (enabled) => {
      if (enabled === active) return;
      active = enabled;
      if (enabled) window.addEventListener('click', on_click, true);
      else window.removeEventListener('click', on_click, true);
    };
  }

  // Each feature may provide: sync(s) for redirects/listeners, css(s) returning rules, hide(s) returning elements.
  const features = [];

  return {
    api,
    DEFAULTS,
    settings_effective,
    page,
    SHORTS_LINK,
    SHORTS_BADGE,
    VIDEO_ID,
    HIDDEN_ATTR,
    css_rule,
    css_hide,
    style_set,
    hidden_sync,
    click_redirect,
    features,
    feature_add: (feature) => features.push(feature)
  };
})();
