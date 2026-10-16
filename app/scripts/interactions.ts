export {};
const toggle = document.querySelector<HTMLButtonElement>('#theme-toggle');
toggle?.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem('sibsys-theme', next);
  } catch {
    /* Storage is optional. */
  }
});
const menuButton = document.querySelector<HTMLButtonElement>('#menu-toggle');
const menu = document.querySelector<HTMLElement>('#mobile-nav');
function closeMenu() {
  if (menu) menu.hidden = true;
  menuButton?.setAttribute('aria-expanded', 'false');
}
menuButton?.addEventListener('click', () => {
  if (!menu) return;
  menu.hidden = !menu.hidden;
  menuButton.setAttribute('aria-expanded', String(!menu.hidden));
});
document.addEventListener('click', (e) => {
  if (!(e.target as Element).closest('.topbar')) closeMenu();
});
matchMedia('(min-width: 761px)').addEventListener('change', (e) => {
  if (e.matches) closeMenu();
});

const dialog = document.querySelector<HTMLDialogElement>('#search-dialog')!;
const input = document.querySelector<HTMLInputElement>('#search-input')!;
const status = document.querySelector<HTMLElement>('#search-status')!;
const results = document.querySelector<HTMLUListElement>('#search-results')!;
type SearchData = { url: string; meta: { title?: string }; excerpt: string };
type Pagefind = {
  search: (query: string) => Promise<{ results: { data: () => Promise<SearchData> }[] }>;
};
let pagefind: Promise<Pagefind> | undefined;
let sequence = 0;
let timer: ReturnType<typeof setTimeout>;
let opener: HTMLElement | null = null;
function openSearch() {
  opener = document.activeElement as HTMLElement;
  dialog.showModal();
  input.focus();
}
function clearResults() {
  sequence++;
  clearTimeout(timer);
  input.value = '';
  results.replaceChildren();
  status.textContent = dialog.dataset.idle!;
}
document
  .querySelectorAll('.search-trigger')
  .forEach((button) => button.addEventListener('click', openSearch));
document.querySelector('#search-close')?.addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => {
  clearResults();
  opener?.focus();
});
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom
    )
      dialog.close();
  }
});
document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    if (!dialog.open) openSearch();
  }
  if (event.key === 'Escape' && menu && !menu.hidden) {
    closeMenu();
    menuButton?.focus();
  }
});
input.addEventListener('input', () => {
  const request = ++sequence;
  clearTimeout(timer);
  results.replaceChildren();
  const query = input.value.trim();
  if (!query) {
    status.textContent = dialog.dataset.idle!;
    return;
  }
  status.textContent = dialog.dataset.loading!;
  timer = setTimeout(async () => {
    try {
      const moduleUrl = '/pagefind/pagefind.js';
      pagefind ??= import(/* @vite-ignore */ moduleUrl).catch((error) => {
        pagefind = undefined;
        throw error;
      });
      const index = await pagefind;
      const response = await index.search(query);
      const found = await Promise.all(response.results.slice(0, 12).map((result) => result.data()));
      if (request !== sequence || !dialog.open) return;
      const safe = found
        .filter((item) => {
          const url = new URL(item.url, location.origin);
          return (
            url.origin === location.origin && url.pathname.startsWith(`/${dialog.dataset.lang}/`)
          );
        })
        .slice(0, 8);
      status.textContent = safe.length
        ? `${safe.length} ${dialog.dataset.results}`
        : dialog.dataset.empty!;
      for (const item of safe) {
        const li = document.createElement('li');
        const link = document.createElement('a');
        const title = document.createElement('strong');
        const excerpt = document.createElement('span');
        link.href = new URL(item.url, location.origin).href;
        title.textContent = item.meta.title ?? item.url;
        // Search excerpts are untrusted HTML; render their text only.
        const parsed = new DOMParser().parseFromString(item.excerpt, 'text/html');
        excerpt.textContent = parsed.body.textContent ?? '';
        link.append(title, excerpt);
        li.append(link);
        results.append(li);
      }
    } catch {
      if (request === sequence) status.textContent = dialog.dataset.error!;
    }
  }, 150);
});
