// Page-world script: blocks playlist auto-advance while the isolated-world side sets the <html> signal attribute.
(() => {
  const SIGNAL_ATTR = 'data-yd-block-playlist-advance';
  const USER_ACTION_WINDOW_MS = 1500;
  const BLOCKED_METHODS = ['nextVideo', 'playVideoAt'];

  const wrappers = new WeakSet();
  let user_action_at = 0;

  const in_playlist = () => new URLSearchParams(location.search).has('list');
  const blocking = () => document.documentElement.hasAttribute(SIGNAL_ATTR) && in_playlist();
  const user_acted_recently = () => Date.now() - user_action_at < USER_ACTION_WINDOW_MS;
  const player_get = () => document.getElementById('movie_player');

  function player_pause() {
    player_get()?.pauseVideo?.();
  }

  // Player methods appear after init and the element is replaced on navigation, so wrapping is retried and checked per method.
  function player_wrap() {
    const player = player_get();
    if (!player) return;
    for (const name of BLOCKED_METHODS) {
      const original = player[name];
      if (typeof original !== 'function' || wrappers.has(original)) continue;
      const wrapper = function (...args) {
        if (blocking() && !user_acted_recently()) {
          player.pauseVideo?.();
          return undefined;
        }
        return original.apply(this, args);
      };
      wrappers.add(wrapper);
      player[name] = wrapper;
    }
  }

  for (const type of ['pointerdown', 'click']) {
    window.addEventListener(type, (event) => {
      if (event.isTrusted && in_playlist()) user_action_at = Date.now();
    }, true);
  }

  // Capture on window runs before YouTube's own listeners on the video element.
  window.addEventListener('ended', (event) => {
    if (!(event.target instanceof HTMLVideoElement) || !blocking()) return;
    event.stopImmediatePropagation();
    event.target.pause();
    player_pause();
  }, true);

  window.addEventListener('yt-navigate', (event) => {
    if (!blocking() || user_acted_recently()) return;
    if (!event.detail?.endpoint?.watchEndpoint?.playlistId) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    player_pause();
  }, true);

  for (const type of ['play', 'playing', 'loadedmetadata', 'yt-navigate-finish', 'yt-player-updated', 'DOMContentLoaded']) {
    window.addEventListener(type, player_wrap, true);
  }
})();
