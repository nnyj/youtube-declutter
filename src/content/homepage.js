// Homepage group: feed hiding, Subscriptions redirect, Shorts in feeds and the Clean Homepage Feed children.
const SUBSCRIPTIONS_URL = 'https://www.youtube.com/feed/subscriptions';
const HOME_LINKS = '#logo, #start a, a[href="/"], a[href="/home"], a[title="YouTube Home"], ytd-logo';
const MEMBERS_CARDS = [
  'yt-lockup-view-model', 'ytd-compact-video-renderer', 'ytd-grid-video-renderer', 'ytd-playlist-video-renderer',
  'ytd-rich-item-renderer', 'ytd-video-renderer', 'ytm-compact-video-renderer', 'ytm-video-with-context-renderer'
].join(', ');
const MEMBERS_BADGES = [
  '.ytBadgeShapeText', '.ytBadgeShapeTextHasMultipleBadgesInRow', '.ytContentMetadataViewModelBadge',
  '.ytContentMetadataViewModelMetadataRow', 'badge-shape', 'yt-badge-view-model'
].join(', ');
const MEMBERS_HEADERS = '#header, #shelf-header-container, #title, h2';
const PROMO_LINK_ATTRS = ['[href*="/premium"]', '[href*="doubleclick"]', '[href*="googleads"]'];

const home_click_redirect = yd.click_redirect((target) => (target.closest(HOME_LINKS) ? SUBSCRIPTIONS_URL : null));

yd.feature_add({
  sync(s) {
    home_click_redirect(s.redirectToSubs);
    if (s.redirectToSubs && yd.page.is_home()) location.replace(SUBSCRIPTIONS_URL);
  }
});

yd.feature_add({
  css(s) {
    if (!s.hideFeed) return '';
    const targets = ['ytd-browse[page-subtype="home"]'];
    if (yd.page.is_home()) targets.push('ytm-browse', 'ytm-feed', 'ytm-rich-grid-renderer');
    return yd.css_hide(targets);
  }
});

yd.feature_add({
  css(s) {
    if (!s.hideShortsHomepage) return '';
    const L = yd.SHORTS_LINK;
    return yd.css_hide([
      'ytd-reel-item-renderer',
      'ytd-reel-shelf-renderer',
      'ytm-reel-shelf-renderer',
      `:is(ytd-rich-section-renderer, ytd-rich-shelf-renderer, ytm-item-section-renderer, ytm-rich-shelf-renderer):has(${L}, ytd-reel-item-renderer, ytm-reel-item-renderer)`,
      `:is(ytd-rich-item-renderer, ytm-reel-item-renderer, ytm-shorts-lockup-view-model, ytm-video-with-context-renderer):has(${L})`,
      `ytd-rich-item-renderer:has(${yd.SHORTS_BADGE})`
    ]);
  }
});

yd.feature_add({
  css(s) {
    if (!s.hideExploreMoreTopics || !yd.page.is_home()) return '';
    return yd.css_hide([
      'ytd-rich-section-renderer:has(ytd-chips-shelf-with-video-shelf-renderer)',
      'ytd-chips-shelf-with-video-shelf-renderer'
    ]);
  }
});

yd.feature_add({
  css(s) {
    if (!s.hideCommunityPosts || !yd.page.is_home()) return '';
    return yd.css_hide([
      'ytd-rich-item-renderer[is-post]',
      'ytd-rich-item-renderer:has(ytd-backstage-post-thread-renderer, ytd-post-renderer)',
      'ytd-rich-section-renderer:has(ytd-rich-item-renderer[is-post])',
      'ytm-backstage-post-renderer',
      'ytm-post-renderer',
      ':is(ytm-item-section-renderer, ytm-rich-item-renderer):has(ytm-backstage-post-renderer, ytm-post-renderer)'
    ]);
  }
});

yd.feature_add({
  css(s) {
    if (!s.hideFeaturedContent || !yd.page.is_home()) return '';
    const promo_parts = [
      '#featured-badge:not([hidden])', '#paygated-featured-badge:not([hidden])',
      'ytd-brand-video-shelf-renderer', 'ytd-brand-video-singleton-renderer', 'ytd-display-ad-renderer',
      'ytd-primetime-promo-renderer', 'ytd-promoted-sparkles-web-renderer', 'ytd-statement-banner-renderer',
      ...PROMO_LINK_ATTRS.map((attr) => `a${attr}`)
    ];
    return yd.css_hide([
      `ytd-rich-section-renderer:has(${promo_parts.join(', ')})`,
      'ytd-primetime-promo-renderer',
      'ytd-statement-banner-renderer'
    ]);
  },
  // Tag-prefix matching (any ytd-* element) has no CSS selector, so this part scans.
  hide(s) {
    if (!s.hideFeaturedContent || !yd.page.is_home()) return [];
    const feed = document.querySelector('ytd-browse[page-subtype="home"]');
    if (!feed) return [];
    const candidates = feed.querySelectorAll(['[class*="premium"]', '[class*="promo"]', ...PROMO_LINK_ATTRS].join(', '));
    return [...candidates].filter((el) => el.localName.startsWith('ytd-'));
  }
});

yd.feature_add({
  css(s) {
    if (!s.hideMembersOnly) return '';
    const member_links = ['channel_memberships', '/membership', 'members-only'].map((part) => `a[href*="${part}" i]`).join(', ');
    return yd.css_hide([
      'ytd-brand-video-shelf-renderer',
      'ytd-rich-section-renderer:has(ytd-brand-video-shelf-renderer)',
      `:is(ytd-rich-section-renderer, ytd-rich-shelf-renderer):has(${member_links})`,
      `:is(${MEMBERS_CARDS}):has(a[href*="members-only"], a[href*="membership"])`
    ]);
  },
  // Header and badge text checks need text content, so they scan.
  hide(s) {
    if (!s.hideMembersOnly) return [];
    const found = [];
    for (const shelf of document.querySelectorAll('ytd-rich-section-renderer, ytd-rich-shelf-renderer')) {
      const headers = [...shelf.querySelectorAll(MEMBERS_HEADERS)].filter((header) => {
        const card = header.closest(MEMBERS_CARDS);
        return !card || !shelf.contains(card);
      });
      if (headers.some((header) => /membership|members[ -]only/i.test(header.textContent))) found.push(shelf);
    }
    for (const card of document.querySelectorAll(MEMBERS_CARDS)) {
      const badges = card.querySelectorAll(MEMBERS_BADGES);
      if ([...badges].some((badge) => /members only|memberships/i.test(badge.textContent))) found.push(card);
    }
    return found;
  }
});

yd.feature_add({
  css(s) {
    if (!s.hidePlayables || !yd.page.is_home()) return '';
    return yd.css_hide(['ytd-rich-section-renderer:has(:is(#rich-shelf-header, #title-container) a[href="/playables"])']);
  }
});
