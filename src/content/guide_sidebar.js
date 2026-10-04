// YouTube Sidebar group: subscriptions, Explore and More from YouTube sections of the left guide.
const YOU_SECTION_LINKS = ['/account', '/feed/history', '/feed/library', '/feed/subscriptions', '/feed/you', '/paid_memberships', '/playlist?list=WL'];
const EXPLORE_TITLES = [
  'explore', 'explorar', 'explorer', 'entdecken', 'esplora', 'verkennen', 'utforska', 'udforsk', 'utforsk', 'tutustu',
  'odkrywaj', 'prozkoumat', 'felfedezés', 'explorează', 'keşfet', 'jelajahi', 'terokai', 'galugarin', 'khám phá',
  'navigator', 'навигатор', 'огляд', 'εξερεύνηση', 'חקירה', 'استكشاف', 'کاوش', 'एक्सप्लोर करें', 'สำรวจ',
  '探索', '探索する', '탐색'
];
const EXPLORE_LINKS = [
  '/channel/UC-9-kyTW8ZkZNDHQJ6FgpwQ', '/channel/UCiGm_E4ZwYSHV3bcW1pnSeQ', '/channel/UClgRkhTL3_hImCAmdLfDE4g',
  '/channel/UCq-Fj5jknLsUf-MWSy4_brA', '/feed/explore', '/feed/storefront', '/feed/trending'
];
const MORE_FROM_YT_TITLES = [
  'more from youtube', 'más de youtube', 'mais do youtube', 'mais no youtube', 'plus de contenus youtube', 'plus sur youtube',
  'mehr von youtube', 'altro da youtube', 'meer van youtube', 'mer från youtube', 'więcej z youtube', 'další z youtube',
  "youtube'dan daha fazla", 'lainnya dari youtube', 'lagi daripada youtube', 'thêm từ youtube', 'другие возможности',
  'інші можливості', 'περισσότερα από το youtube', 'المزيد من youtube', 'youtube से जुड़ी और सेवाएं', 'บริการอื่นๆ ของ youtube',
  'youtube のその他の機能', 'youtube 더보기', '更多 youtube 产品', '更多 youtube 服務', 'youtube 的更多内容'
];
const MORE_FROM_YT_LINK_PARTS = [
  '/fashion', '/gaming', '/news', '/podcasts', '/premium', '/shopping', 'music.youtube.com', 'studio.youtube.com', 'youtubekids.com'
];
const CHANNEL_ENTRY_PREFIXES = ['/@', '/c/', '/channel/'];

function guide_section_title(section) {
  return section.querySelector('#guide-section-title')?.textContent.trim().toLowerCase() ?? '';
}

function guide_section_hrefs(section) {
  return [...section.querySelectorAll('a[href]')].map((link) => link.getAttribute('href'));
}

function is_you_section(section) {
  return guide_section_hrefs(section).some((href) => YOU_SECTION_LINKS.some((prefix) => href.startsWith(prefix)));
}

// The main section also links /feed/subscriptions, so a section holding the Home entry is never the subscriptions list.
function subscriptions_section(sections) {
  return (
    sections.find((section) =>
      section.querySelector('a#endpoint[href^="/feed/subscriptions"]') && !section.querySelector('a#endpoint[href="/"]')) ??
    sections.find((section) => section.querySelector('a#endpoint[href^="/feed/channels"]')) ??
    null
  );
}

yd.feature_add({
  hide(s) {
    if (!s.hideSubscriptions && !s.hideExplore && !s.hideMoreFromYT) return [];
    const sections = [...document.querySelectorAll('ytd-guide-section-renderer')];
    const found = [];

    if (s.hideSubscriptions) {
      const section = subscriptions_section(sections);
      if (section) found.push(section);
      for (const entry of (section ?? document).querySelectorAll('ytd-guide-entry-renderer')) {
        const href = entry.querySelector('#endpoint')?.getAttribute('href') ?? '';
        if (CHANNEL_ENTRY_PREFIXES.some((prefix) => href.startsWith(prefix))) found.push(entry);
      }
    }

    for (const section of sections) {
      if ((!s.hideExplore && !s.hideMoreFromYT) || is_you_section(section)) continue;
      const title = guide_section_title(section);
      const hrefs = guide_section_hrefs(section);
      const is_explore = EXPLORE_TITLES.includes(title) || hrefs.some((href) => EXPLORE_LINKS.some((prefix) => href.startsWith(prefix)));
      const is_more_from_yt = MORE_FROM_YT_TITLES.includes(title) || hrefs.some((href) => MORE_FROM_YT_LINK_PARTS.some((part) => href.includes(part)));
      if (s.hideExplore && is_explore) found.push(section);
      if (s.hideMoreFromYT && is_more_from_yt) {
        found.push(section);
        const next = section.nextElementSibling;
        if (next?.localName === 'ytd-guide-collapsible-entry-renderer') found.push(next);
      }
    }
    return found;
  }
});
