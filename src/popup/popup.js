'use strict';

const api = globalThis.browser ?? globalThis.chrome;

const FEEDBACK_URL = 'https://github.com/nnyj/youtube-declutter/issues';
const THUMBNAIL_MODES = ['off', 'hidden', 'reveal-on-hover', 'solid-color', 'blurred'];

// One entry per popup row, in display order.
// `parent`: parent on covers this child, see SPEC.md `### Toggle behavior`.
// `requires`: row shown only while that key is on.
const GROUPS = [
  { id: 'homepage', rows: [
    { key: 'hideFeed' },
    { key: 'redirectToSubs', requires: 'hideFeed' },
    { key: 'hideShortsHomepage' },
    { key: 'hideExploreMoreTopics' },
    { key: 'cleanHomepageFeed' },
    { key: 'hideCommunityPosts', parent: 'cleanHomepageFeed' },
    { key: 'hideFeaturedContent', parent: 'cleanHomepageFeed' },
    { key: 'hideMembersOnly', parent: 'cleanHomepageFeed' },
    { key: 'hidePlayables', parent: 'cleanHomepageFeed' }
  ] },
  { id: 'subscriptions', rows: [
    { key: 'hideMostRelevantSubscriptions' },
    { key: 'hideSubsLiveStreams' }
  ] },
  { id: 'shorts', rows: [
    { key: 'hideShortsGlobally' },
    { key: 'redirectShorts' }
  ] },
  { id: 'thumbnails', rows: [
    { key: 'hideVideoThumbnails', type: 'select' }
  ] },
  { id: 'video', rows: [
    { key: 'hideSidebar' },
    { key: 'hideRecommended', parent: 'hideSidebar' },
    { key: 'hideSidebarShorts', parent: 'hideSidebar' },
    { key: 'hidePlaylists', parent: 'hideSidebar' },
    { key: 'hideComments' },
    { key: 'hideLiveChat' },
    { key: 'hideEndCards' },
    { key: 'disableAutoplay' },
    { key: 'disablePlaylistAutoplay', parent: 'disableAutoplay' },
    { key: 'disableRegularAutoplay', parent: 'disableAutoplay' }
  ] },
  { id: 'search', rows: [
    { key: 'hideSearchRecommended' },
    { key: 'hideShortsSearch' }
  ] },
  { id: 'sidebar', rows: [
    { key: 'cleanSidebar' },
    { key: 'hideSubscriptions', parent: 'cleanSidebar' },
    { key: 'hideExplore', parent: 'cleanSidebar' },
    { key: 'hideMoreFromYT', parent: 'cleanSidebar' }
  ] }
];

const ROWS = GROUPS.flatMap((group) => group.rows);

const DEFAULTS = { extensionEnabled: true };
for (const row of ROWS) DEFAULTS[row.key] = false;

const CHILDREN = {};
for (const row of ROWS) {
  if (row.parent) (CHILDREN[row.parent] ??= []).push(row.key);
}

const LANG = (navigator.language || 'en').slice(0, 2).toLowerCase();

function t(id) {
  return STRINGS[LANG]?.[id] ?? STRINGS.en[id] ?? id;
}

let settings = { ...DEFAULTS };
let collapsed = {};

function thumbnail_mode(value) {
  return THUMBNAIL_MODES.includes(value) ? value : 'off';
}

// Every key changed by one user action, written in one storage call.
function changes_for(key, value) {
  const changes = { [key]: value };

  if (value && CHILDREN[key]) {
    for (const child of CHILDREN[key]) changes[child] = false;
  }

  if (key === 'hideFeed' && !value) changes.redirectToSubs = false;

  const parent = ROWS.find((row) => row.key === key)?.parent;
  if (value && parent) {
    const siblings = CHILDREN[parent];
    const all_on = siblings.every((child) => child === key || settings[child] === true);
    if (all_on) {
      changes[parent] = true;
      for (const child of siblings) changes[child] = false;
    }
  }

  return changes;
}

async function save(changes) {
  Object.assign(settings, changes);
  render();
  try {
    await api.storage.sync.set(changes);
  } catch (error) {
    console.error('storage write failed', error);
  }
}

function build_toggle(row) {
  const id = `opt_${row.key}`;
  const label = document.createElement('label');
  label.className = 'row_label';
  label.htmlFor = id;
  label.textContent = t(row.key);

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = id;
  input.className = 'switch';
  input.setAttribute('role', 'switch');
  input.addEventListener('change', () => {
    const changes = changes_for(row.key, input.checked);
    save(changes);
    // Child just covered by its parent disappears, keep focus in the list.
    if (row.parent && changes[row.parent]) {
      document.getElementById(`opt_${row.parent}`).focus();
    }
  });

  return [label, input];
}

function build_select(row) {
  const id = `opt_${row.key}`;
  const label = document.createElement('label');
  label.className = 'row_label';
  label.htmlFor = id;
  label.textContent = t(row.key);

  const select = document.createElement('select');
  select.id = id;
  select.className = 'select';
  for (const mode of THUMBNAIL_MODES) {
    const option = document.createElement('option');
    option.value = mode;
    option.textContent = t(`thumbs_${mode}`);
    select.append(option);
  }
  select.addEventListener('change', () => save({ [row.key]: select.value }));

  return [label, select];
}

function build_group(group) {
  const section = document.createElement('section');
  section.className = 'group';

  const list_id = `group_${group.id}`;
  const header = document.createElement('h2');
  header.className = 'group_heading';

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'group_toggle';
  toggle.id = `toggle_${group.id}`;
  toggle.setAttribute('aria-controls', list_id);
  toggle.textContent = t(`group_${group.id}`);
  toggle.addEventListener('click', () => {
    collapsed = { ...collapsed, [group.id]: !collapsed[group.id] };
    render_group_state(group.id);
    api.storage.sync.set({ collapsedGroups: collapsed }).catch((error) => {
      console.error('storage write failed', error);
    });
  });
  header.append(toggle);

  const list = document.createElement('div');
  list.className = 'group_rows';
  list.id = list_id;

  for (const row of group.rows) {
    const item = document.createElement('div');
    item.className = 'row';
    item.id = `row_${row.key}`;
    if (row.parent || row.requires) item.classList.add('row_child');
    const parts = row.type === 'select' ? build_select(row) : build_toggle(row);
    item.append(...parts);
    list.append(item);
  }

  section.append(header, list);
  return section;
}

function render_group_state(group_id) {
  const is_collapsed = collapsed[group_id] === true;
  document.getElementById(`toggle_${group_id}`).setAttribute('aria-expanded', String(!is_collapsed));
  document.getElementById(`group_${group_id}`).hidden = is_collapsed;
}

function row_visible(row) {
  if (row.parent) return !settings[row.parent];
  if (row.requires) return settings[row.requires] === true;
  return true;
}

function render() {
  const enabled = settings.extensionEnabled !== false;
  document.body.classList.toggle('is_off', !enabled);
  document.getElementById('power').setAttribute('aria-pressed', String(enabled));
  document.getElementById('groups').hidden = !enabled;
  document.getElementById('off_message').hidden = enabled;

  for (const row of ROWS) {
    document.getElementById(`row_${row.key}`).hidden = !row_visible(row);
    const control = document.getElementById(`opt_${row.key}`);
    if (row.type === 'select') control.value = thumbnail_mode(settings[row.key]);
    else control.checked = settings[row.key] === true;
  }
}

function open_feedback(event) {
  event.preventDefault();
  api.tabs.create({ url: FEEDBACK_URL }).then(() => window.close(), (error) => {
    console.error('open tab failed', error);
  });
}

async function init() {
  document.documentElement.lang = STRINGS[LANG] ? LANG : 'en';
  for (const node of document.querySelectorAll('[data-i18n]')) {
    node.textContent = t(node.dataset.i18n);
  }
  const power = document.getElementById('power');
  power.title = t('power_tooltip');
  power.setAttribute('aria-label', t('power_tooltip'));
  power.addEventListener('click', () => save({ extensionEnabled: settings.extensionEnabled === false }));

  document.getElementById('version').textContent = t('version').replace('{version}', api.runtime.getManifest().version);
  document.getElementById('feedback').addEventListener('click', open_feedback);

  try {
    const stored = await api.storage.sync.get(null);
    settings = { ...DEFAULTS, ...stored };
    collapsed = stored.collapsedGroups && typeof stored.collapsedGroups === 'object' ? stored.collapsedGroups : {};
  } catch (error) {
    console.error('storage read failed, using defaults', error);
  }

  const container = document.getElementById('groups');
  for (const group of GROUPS) {
    container.append(build_group(group));
    render_group_state(group.id);
  }
  render();
  document.body.classList.add('is_ready');
}

init();
