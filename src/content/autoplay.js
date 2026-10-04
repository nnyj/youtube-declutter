// Disable Autoplay: keeps YouTube's autoplay switch off, hides autoplay UI and signals the page-world playlist blocker.
const PLAYLIST_BLOCK_ATTR = 'data-yd-block-playlist-advance';
const AUTOPLAY_SWITCHES = 'button.ytp-autonav-toggle-button, button[data-tooltip-target-id="ytp-autonav-toggle-button"], ' +
  '.ytm-autonav-toggle-button-container button, .ytp-autonav-toggle-button-container button';
const AUTOPLAY_UI = [
  '.ytm-autonav-bar', '.ytm-autonav-toggle-button-container', '.ytm-upnext-autoplay-container', '.ytp-autonav-toggle-button',
  '.ytp-autonav-toggle-button-bg', '.ytp-autonav-toggle-button-cancel', '.ytp-autonav-toggle-button-container',
  '.ytp-autonav-toggle-button-visible', '.ytp-autonav-toggle-tooltip', '.ytp-next-button', '.ytp-prev-button',
  '.ytp-upnext-autoplay-icon',
  ':is(.ytp-chrome-bottom, .ytp-chrome-controls) :is([aria-label*="autoplay" i], [data-tooltip*="autoplay" i])',
  '.ytp-autonav-endscreen', '.ytp-autonav-endscreen-countdown', '.ytp-autonav-endscreen-upnext-button',
  '.ytp-autonav-endscreen-upnext-container', '.ytp-upnext', '.ytp-upnext-container'
];
// A click flips the switch asynchronously, this gap stops a second click from flipping it back on.
const SWITCH_CLICK_COOLDOWN_MS = 500;

const switch_clicked_at = new WeakMap();
let watched_switches = new WeakSet();
const switch_observer = new MutationObserver(() => autoplay_switches_off());

function autoplay_active(s) {
  return s.disableAutoplay || (yd.page.has_list() ? s.disablePlaylistAutoplay : s.disableRegularAutoplay);
}

function autoplay_switch_is_on(button) {
  const checked = button.matches('[aria-checked]') ? button : button.querySelector('[aria-checked]');
  if (checked) return checked.getAttribute('aria-checked') === 'true';
  if (button.hasAttribute('aria-pressed')) return button.getAttribute('aria-pressed') === 'true';
  return button.classList.contains('ytp-autonav-toggle-button-active');
}

function autoplay_switches_off() {
  for (const button of new Set(document.querySelectorAll(AUTOPLAY_SWITCHES))) {
    if (!watched_switches.has(button)) {
      watched_switches.add(button);
      switch_observer.observe(button, {
        attributes: true,
        subtree: true,
        attributeFilter: ['aria-checked', 'aria-pressed', 'class']
      });
    }
    const clicked_at = switch_clicked_at.get(button) ?? 0;
    if (autoplay_switch_is_on(button) && Date.now() - clicked_at > SWITCH_CLICK_COOLDOWN_MS) {
      switch_clicked_at.set(button, Date.now());
      button.click();
    }
  }
}

yd.feature_add({
  sync(s) {
    const active = autoplay_active(s);
    document.documentElement.toggleAttribute(PLAYLIST_BLOCK_ATTR, active && yd.page.has_list());
    if (active) {
      autoplay_switches_off();
    } else {
      switch_observer.disconnect();
      watched_switches = new WeakSet();
    }
  },
  css: (s) => (autoplay_active(s) ? yd.css_hide(AUTOPLAY_UI) : '')
});
