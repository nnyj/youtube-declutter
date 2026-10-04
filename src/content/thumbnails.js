// Thumbnails group: one of hidden, reveal-on-hover, blurred or solid-color modes.
const THUMBNAIL_CSS = {
  'off': () => '',

  'hidden': () =>
    yd.css_hide([
      '#thumbnail', '#thumbnail-container', '#video-preview', '.rich-thumbnail', '.yt-lockup-view-model-wiz__content-image',
      '.ytd-display-ad-renderer #media-container', '.ytp-modern-videowall-still-image', '.ytp-videowall-still-image',
      'yt-thumbnail-view-model', 'ytd-playlist-thumbnail', 'ytd-thumbnail', 'ytm-playlist-thumbnail',
      'ytm-reel-item-renderer .video-thumbnail-container-vertical', 'ytm-thumbnail'
    ]) +
    yd.css_rule(
      ['.ytp-modern-videowall-still-info-content', '.ytp-videowall-still-info-content'],
      'opacity: 1 !important; visibility: visible !important;'
    ) +
    yd.css_rule(
      ['ytm-reel-shelf-renderer .reel-shelf-items > *'],
      'height: auto !important; min-height: 0 !important; align-self: flex-start !important;'
    ),

  'reveal-on-hover': () => {
    const cards = ':is(yt-lockup-view-model, ytd-compact-video-renderer, ytd-rich-item-renderer, ytd-video-renderer)';
    const thumbs = ':is(.yt-lockup-view-model-wiz__content-image, yt-thumbnail-view-model, ytd-thumbnail)';
    const transition = 'transition: max-height 0.3s ease, max-width 0.3s ease, opacity 0.3s ease !important;';
    return (
      yd.css_rule([`${cards} ${thumbs}`], `max-height: 0 !important; max-width: 0 !important; opacity: 0 !important; overflow: hidden !important; ${transition}`) +
      yd.css_rule([`${cards}:hover ${thumbs}`], 'max-height: 1000px !important; max-width: 100% !important; opacity: 1 !important;') +
      yd.css_rule(['.rich-thumbnail', 'ytd-playlist-thumbnail'], transition)
    );
  },

  'blurred': () =>
    yd.css_rule(
      [
        ':is(#video-preview, yt-thumbnail-view-model, ytd-playlist-thumbnail, ytd-thumbnail, ytm-thumbnail) img',
        '.ytp-modern-videowall-still-image',
        '.ytp-videowall-still-image'
      ],
      'filter: blur(24px) !important;'
    ),

  // YouTube's chip background variable switches with its dark and light themes.
  'solid-color': () => {
    const boxes = ':is(yt-thumbnail-view-model, ytd-playlist-thumbnail, ytd-thumbnail, ytm-thumbnail)';
    return (
      yd.css_rule(
        [boxes],
        'background: var(--yt-spec-badge-chip-background, rgba(128, 128, 128, 0.25)) !important; border-radius: 12px !important;'
      ) +
      yd.css_rule([`${boxes} :is(.yt-core-image, img)`], 'visibility: hidden !important;')
    );
  }
};

yd.feature_add({
  css: (s) => THUMBNAIL_CSS[s.thumbnails]()
});
