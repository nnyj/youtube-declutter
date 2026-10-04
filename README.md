# youtube-declutter

<div align="center">

[![Stars](https://img.shields.io/github/stars/nnyj/youtube-declutter?style=for-the-badge&labelColor=555&color=e3b341)](https://github.com/nnyj/youtube-declutter/stargazers)

</div>

Firefox and Chromium extension that hides YouTube Shorts, feeds, recommendations and other distractions, each behind its own toggle.

## Features

- Hide homepage feed, optional redirect to Subscriptions
- Hide Shorts on every page, or redirect them to the regular player
- Hide video sidebar, comments, live chat and end screen cards
- Disable autoplay, separately for playlists and regular videos
- Hide search recommendations, Explore, Trending and More from YouTube
- Hide, blur or reveal-on-hover thumbnails
- One power button turns every rule off

## Install

```sh
bash scripts/build.sh
```

- Firefox 128+: `about:debugging#/runtime/this-firefox` → Load Temporary Add-on → `dist/manifest.json`
- Chromium 121+: `chrome://extensions` → Developer mode → Load unpacked → `dist`

Temporary Firefox add-ons are removed on browser restart. Chromium warns about the Firefox-only `background.scripts` and `browser_specific_settings` keys and ignores them.

## Privacy

No data collection or network requests. Settings live in `storage.sync`.

## License

[MIT](LICENSE)
