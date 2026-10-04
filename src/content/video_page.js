// Video page group: sidebar, recommendations, sidebar Shorts, playlist panel, comments, live chat and end screens.
const SIDEBAR_ROOTS = ':is(#related, #secondary, ytd-watch-next-secondary-results-renderer, ' +
  'ytm-item-section-renderer[section-identifier="related-items"], ytm-watch-next-secondary-results-renderer)';
const PROTECTED_PANELS = '[target-id], ytd-engagement-panel-section-list-renderer, ytd-playlist-panel-renderer, ' +
  'ytd-playlist-panel-view-model, ytm-engagement-panel-section-list-renderer, ytm-playlist-panel-renderer';
const NOT_PROTECTED = `:not(:is(${PROTECTED_PANELS}) *)`;
const RECOMMENDED_CARDS = [
  'yt-lockup-view-model', 'ytd-compact-autoplay-renderer', 'ytd-compact-movie-renderer', 'ytd-compact-radio-renderer',
  'ytd-compact-video-renderer', 'ytd-reel-shelf-renderer', 'ytd-video-renderer', 'ytm-compact-autoplay-renderer',
  'ytm-compact-video-renderer', 'ytm-video-with-context-renderer'
].join(', ');
const END_SCREEN_TARGETS = [
  '.html5-endscreen', '.videowall-endscreen', '.ytp-autonav-endscreen', '.ytp-autonav-endscreen-button-container',
  '.ytp-autonav-endscreen-countdown', '.ytp-autonav-endscreen-countdown-container', '.ytp-autonav-endscreen-upnext-button',
  '.ytp-autonav-endscreen-upnext-container', '.ytp-ce-channel', '.ytp-ce-covering-image', '.ytp-ce-covering-overlay',
  '.ytp-ce-element', '.ytp-ce-element-show', '.ytp-ce-expanding-overlay', '.ytp-ce-playlist', '.ytp-ce-shadow',
  '.ytp-ce-size-1280', '.ytp-ce-size-853', '.ytp-ce-video', '.ytp-ce-website', '.ytp-endscreen-content',
  '.ytp-endscreen-next', '.ytp-endscreen-paginate', '.ytp-endscreen-previous', '.ytp-modern-videowall',
  '.ytp-modern-videowall-container', '.ytp-pause-overlay', '.ytp-pause-overlay-container', '.ytp-suggestion-set',
  '.ytp-upnext', '.ytp-upnext-container', '.ytp-videowall-still', '.ytp-videowall-still-image',
  '.ytp-videowall-still-info', '.ytp-videowall-still-list'
];

yd.feature_add({
  css(s) {
    if (!s.hideSidebar || !yd.page.is_watch()) return '';
    const flexy = 'ytd-watch-flexy[is-two-columns_]';
    return (
      yd.css_hide([`${flexy} #secondary`]) +
      yd.css_rule([`${flexy} #columns`], 'justify-content: center !important;') +
      yd.css_rule(
        [`${flexy} #primary`],
        'max-width: var(--ytd-watch-flexy-max-player-width, 1280px) !important; width: calc(100% - 32px) !important; ' +
          'min-width: 0 !important; margin-left: auto !important; margin-right: auto !important; ' +
          'padding-left: 0 !important; padding-right: 0 !important;'
      ) +
      yd.css_rule(
        [`${flexy} :is(#below, #comments, #meta, #primary-inner)`],
        'width: 100% !important; max-width: none !important;'
      ) +
      yd.css_rule(['html:has(ytd-watch-flexy[is-two-columns_])', 'body:has(ytd-watch-flexy[is-two-columns_])'], 'overflow-x: hidden !important;')
    );
  }
});

yd.feature_add({
  css(s) {
    if (!s.hideRecommended || !yd.page.is_watch()) return '';
    const targets = [
      'yt-chip-cloud-renderer', 'yt-lockup-view-model', 'yt-related-chip-cloud-renderer', 'ytd-compact-autoplay-renderer',
      'ytd-compact-movie-renderer', 'ytd-compact-radio-renderer', 'ytd-compact-video-renderer',
      'ytd-feed-filter-chip-bar-renderer', 'ytd-item-section-renderer > #contents', 'ytd-reel-item-renderer',
      'ytd-reel-shelf-renderer', 'ytd-video-renderer', 'ytm-compact-autoplay-renderer', 'ytm-compact-video-renderer',
      'ytm-item-section-renderer', 'ytm-video-with-context-renderer'
    ];
    const containers = [
      '#items', '#related', 'ytd-item-section-renderer', 'ytd-watch-next-secondary-results-renderer',
      'ytm-watch-next-secondary-results-renderer'
    ];
    const keeps_panel = ':not(:has(ytd-engagement-panel-section-list-renderer, ytd-transcript-segment-list-renderer))';
    const collapse = 'height: 0 !important; min-height: 0 !important; overflow: hidden !important; pointer-events: none !important;';
    return (
      yd.css_hide(targets.map((target) => `${SIDEBAR_ROOTS} ${target}${NOT_PROTECTED}`)) +
      yd.css_rule(
        [
          `${SIDEBAR_ROOTS} :is(${containers.join(', ')}):has(${RECOMMENDED_CARDS})${keeps_panel}${NOT_PROTECTED}`,
          // The continuation spinner holds no cards yet, collapsing it stops infinite scroll from loading more.
          `${SIDEBAR_ROOTS} ytd-continuation-item-renderer${NOT_PROTECTED}`
        ],
        collapse
      )
    );
  }
});

yd.feature_add({
  css(s) {
    if (!s.hideSidebarShorts || !yd.page.is_watch()) return '';
    const always = [
      'ytd-compact-video-renderer[is-shorts]', 'ytd-reel-item-renderer', 'ytd-reel-shelf-renderer', 'ytm-reel-item-renderer',
      'ytm-reel-shelf-renderer', 'ytm-shorts-lockup-view-model', 'ytm-shorts-lockup-view-model-v2'
    ];
    const cards = ':is(ytd-compact-video-renderer, ytd-video-renderer, ytm-compact-video-renderer, ytm-video-with-context-renderer)';
    return yd.css_hide([
      ...always.map((target) => `${SIDEBAR_ROOTS} ${target}${NOT_PROTECTED}`),
      `${SIDEBAR_ROOTS} ${cards}:has(${yd.SHORTS_LINK}, ${yd.SHORTS_BADGE})${NOT_PROTECTED}`
    ]);
  }
});

yd.feature_add({
  css(s) {
    if (!s.hidePlaylists || !yd.page.is_watch()) return '';
    return yd.css_hide(['#playlist', 'ytd-playlist-panel-renderer', 'ytd-playlist-panel-view-model']);
  }
});

yd.feature_add({
  css(s) {
    if (!s.hideComments) return '';
    return yd.css_hide([
      '#comments', 'ytd-comments', 'ytd-comments-entry-point-header-renderer', 'ytm-comment-thread-renderer',
      'ytm-comments-entry-point-header-renderer', 'ytm-comments-section-renderer', 'ytm-structured-description-content-renderer'
    ]);
  }
});

yd.feature_add({
  css: (s) => (s.hideLiveChat ? yd.css_hide(['#chat']) : '')
});

yd.feature_add({
  css: (s) => (s.hideEndCards ? yd.css_hide(END_SCREEN_TARGETS) : '')
});
