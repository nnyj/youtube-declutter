// YouTube Shorts group: hide Shorts on all pages and open Shorts in the regular watch player.
function shorts_watch_url(href, query = '') {
  const match = /^\/shorts\/([^/?#]+)\/?(?:[?#]|$)/.exec(href);
  if (!match || !yd.VIDEO_ID.test(match[1])) return null;
  return `https://www.youtube.com/watch?v=${match[1]}${query ? `&${query}` : ''}`;
}

const shorts_click_redirect = yd.click_redirect((target) => {
  const link = target.closest('[href^="/shorts/"]');
  return link ? shorts_watch_url(link.getAttribute('href')) : null;
});

yd.feature_add({
  sync(s) {
    shorts_click_redirect(s.redirectShorts);
    if (!s.redirectShorts) return;
    const url = shorts_watch_url(location.pathname, location.search.slice(1));
    if (url) location.replace(url);
  }
});

yd.feature_add({
  css(s) {
    if (!s.hideShortsGlobally) return '';
    const L = yd.SHORTS_LINK;
    const cards = [
      'ytd-compact-video-renderer', 'ytd-expanded-shelf-contents-renderer', 'ytd-grid-video-renderer',
      'ytd-rich-item-renderer', 'ytd-video-renderer', 'ytm-video-with-context-renderer'
    ].join(', ');
    return yd.css_hide([
      'ytd-reel-item-renderer',
      'ytd-reel-shelf-renderer',
      'ytm-reel-shelf-renderer',
      'ytm-shorts-lockup-view-model',
      'ytm-shorts-lockup-view-model-v2',
      `:is(grid-shelf-view-model, ytd-rich-section-renderer, ytd-rich-shelf-renderer):has(${L}, ytd-reel-item-renderer, ytm-shorts-lockup-view-model)`,
      `:is(${cards}):has(${L}, ${yd.SHORTS_BADGE})`,
      'yt-chip-cloud-chip-renderer:has([data-pivot-id="shorts"], [href^="/shorts"], [title*="short" i], [aria-label*="short" i])'
    ]);
  }
});
