// Subscriptions page group: Most Relevant carousel and live/upcoming/premiere items.
const LIVE_BADGES = [
  'badge-shape.ytBadgeShapeThumbnailLive',
  'ytd-thumbnail-overlay-time-status-renderer[overlay-style="LIVE"]',
  'ytd-thumbnail-overlay-time-status-renderer[overlay-style="UPCOMING"]'
].join(', ');

function is_scheduled_badge(badge) {
  const text = badge.querySelector('.ytBadgeShapeText')?.textContent.trim() ?? '';
  return text === 'Upcoming' || /^premieres/i.test(text);
}

yd.feature_add({
  css(s) {
    if (!s.hideMostRelevantSubscriptions || !yd.page.is_subscriptions()) return '';
    return yd.css_hide([
      'ytd-rich-section-renderer' +
        ':has(ytd-rich-shelf-renderer[has-expansion-button][restrict-contents-overflow])' +
        ':has(#rich-shelf-header, #rich-shelf-header-container)' +
        ':has(#next-button, #previous-button)' +
        ':has(ytd-rich-item-renderer[is-shelf-item], ytd-rich-item-renderer[lockup])' +
        ':has(.expand-collapse-button, .button-container ytd-button-renderer)'
    ]);
  }
});

yd.feature_add({
  hide(s) {
    if (!s.hideSubsLiveStreams || !yd.page.is_subscriptions()) return [];
    const badges = [
      ...document.querySelectorAll(LIVE_BADGES),
      ...[...document.querySelectorAll('badge-shape.ytBadgeShapeThumbnailDefault')].filter(is_scheduled_badge)
    ];
    return badges.map((badge) => badge.closest('ytd-grid-video-renderer, ytd-rich-item-renderer') ?? badge);
  }
});
