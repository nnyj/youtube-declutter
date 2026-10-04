// Home and Shorts tabs in the guide, mini guide, mobile bottom bar and channel tabs, derived from other settings.
const TAB_SHAPES = ':is(tp-yt-paper-tab, yt-chip-cloud-chip-renderer, yt-tab-shape)';
const GUIDE_ENTRIES = ':is(ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer)';

yd.feature_add({
  css(s) {
    let css = '';
    if (s.home_tab) {
      css += yd.css_hide([
        `${GUIDE_ENTRIES}:has(a[href="/"], a[href="/home"], a[title="Home"], #endpoint[title="Home"])`,
        `${TAB_SHAPES}:has(a[href="/"], a[href^="/home"], a[title="Home"], div[title="Home"])`,
        'ytm-pivot-bar-item-renderer:has([href="/"], [href="/home"])'
      ]);
    }
    if (s.shorts_tab) {
      css += yd.css_hide([
        `${GUIDE_ENTRIES}:has(a[href^="/shorts"], a[title="Shorts"], #endpoint[title="Shorts"])`,
        `${TAB_SHAPES}:has(a[href^="/shorts"], a[title="Shorts"], div[title*="shorts" i])`,
        'ytm-pivot-bar-item-renderer:has([href^="/shorts"], [data-pivot-id="shorts"])'
      ]);
    }
    return css;
  }
});
