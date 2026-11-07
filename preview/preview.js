/* Offline browser preview only; never loaded by Obsidian. */
const $ = (selector) => document.querySelector(selector);
const body = document.body;
const themeToggle = $('#theme-toggle');
const viewToggle = $('#view-toggle');
const searchDialog = $('#search-dialog');
const searchInput = $('#note-search');
const entries = [...document.querySelectorAll('#reading-pane [id]')].map((node) => ({
  id: node.id,
  title: node.id === 'note-top' ? '这样的夜晚' : node.textContent,
}));

function toggleTheme() {
  const dark = body.classList.toggle('theme-dark');
  body.classList.toggle('theme-light', !dark);
  themeToggle.setAttribute('aria-pressed', String(dark));
  themeToggle.querySelector('span').textContent = dark ? '切换浅色' : '切换深色';
  themeToggle.querySelector('use').setAttribute('href', dark ? '#sun' : '#moon');
  $('#mode-name').textContent = dark ? '炭灰 · 深色' : '暖灰 · 浅色';
}

function setEditing(editing) {
  $('#reading-pane').hidden = editing;
  $('#editing-pane').hidden = !editing;
  viewToggle.setAttribute('aria-pressed', String(editing));
  viewToggle.querySelector('span').textContent = editing ? '阅读预览' : '编辑预览';
  viewToggle.querySelector('use').setAttribute('href', editing ? '#book' : '#edit');
  $('#view-name').textContent = editing ? '编辑样式示意' : '阅读预览';
  $('#note-scroller').scrollTop = 0;
}

function setSidebar(open) {
  body.classList.toggle('sidebar-open', open);
  $('#sidebar-scrim').hidden = !open;
  $('#mobile-files').setAttribute('aria-expanded', String(open));
}

function showResults() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  const matches = entries.filter((entry) => entry.title.toLocaleLowerCase().includes(query));
  const results = $('#search-results');
  results.replaceChildren();
  for (const entry of matches) {
    const button = document.createElement('button');
    button.className = 'suggestion-item';
    button.textContent = entry.title;
    button.addEventListener('click', () => {
      searchDialog.close();
      setEditing(false);
      document.getElementById(entry.id).scrollIntoView({ block: 'start' });
    });
    results.append(button);
  }
  if (!matches.length) {
    const empty = document.createElement('p');
    empty.className = 'search-empty';
    empty.textContent = '没有匹配的章节，试试“夜晚”或“明天”。';
    results.append(empty);
  }
}

function openSearch() {
  setSidebar(false);
  searchInput.value = '';
  showResults();
  searchDialog.showModal();
  searchInput.focus();
}

themeToggle.addEventListener('click', toggleTheme);
$('#ribbon-theme').addEventListener('click', toggleTheme);
viewToggle.addEventListener('click', () => setEditing($('#editing-pane').hidden));
$('#header-view-toggle').addEventListener('click', () => setEditing($('#editing-pane').hidden));
$('#files-toggle').addEventListener('click', () => {
  const collapsed = body.classList.toggle('sidebar-collapsed');
  $('#files-toggle').setAttribute('aria-expanded', String(!collapsed));
});
$('#mobile-files').addEventListener('click', () => setSidebar(!body.classList.contains('sidebar-open')));
$('#sidebar-scrim').addEventListener('click', () => setSidebar(false));
document.querySelectorAll('[data-search]').forEach((button) => button.addEventListener('click', openSearch));
$('#close-search').addEventListener('click', () => searchDialog.close());
searchInput.addEventListener('input', showResults);
searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') $('#search-results button')?.click();
});
document.querySelectorAll('a[href^="#"]').forEach((link) => link.addEventListener('click', () => {
  if (!$('#editing-pane').hidden) setEditing(false);
  setSidebar(false);
}));
document.querySelectorAll('.task-list-item input').forEach((input) => input.addEventListener('change', () => {
  input.closest('li').classList.toggle('is-checked', input.checked);
}));
document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'p') {
    event.preventDefault();
    if (!searchDialog.open) openSearch();
  }
  if (event.key === 'Escape') setSidebar(false);
});
matchMedia('(max-width: 760px)').addEventListener('change', () => {
  setSidebar(false);
  body.classList.remove('sidebar-collapsed');
  $('#files-toggle').setAttribute('aria-expanded', 'true');
});
