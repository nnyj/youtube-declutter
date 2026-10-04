// Search Results group: injected recommendation shelves and Shorts in search results.
const SEARCH_PAGE = ':is(ytd-search, [page-subtype="search"], ytm-search)';

yd.feature_add({
  css(s) {
    if (!s.hideSearchRecommended) return '';
    return yd.css_hide([
      ':is(ytd-search, ytd-two-column-search-results-renderer, [page-subtype="search"]) :is(ytd-horizontal-card-list-renderer, ytd-shelf-renderer)',
      ':is(ytd-search, [page-subtype="search"]) grid-shelf-view-model',
      'ytm-search :is(ytm-horizontal-card-list-renderer, ytm-shelf-renderer)'
    ]);
  }
});

yd.feature_add({
  css(s) {
    if (!s.hideShortsSearch) return '';
    return yd.css_hide([
      `${SEARCH_PAGE} :is(grid-shelf-view-model, ytd-reel-item-renderer, ytd-reel-shelf-renderer)`,
      `${SEARCH_PAGE} :is(ytd-rich-section-renderer, ytd-rich-shelf-renderer):has(${yd.SHORTS_LINK}, ytd-reel-item-renderer)`,
      `${SEARCH_PAGE} ytd-video-renderer:has(${yd.SHORTS_LINK}, ${yd.SHORTS_BADGE})`,
      `${SEARCH_PAGE} yt-chip-cloud-chip-renderer:has([data-pivot-id="shorts"], [href^="/shorts"])`
    ]);
  }
});
