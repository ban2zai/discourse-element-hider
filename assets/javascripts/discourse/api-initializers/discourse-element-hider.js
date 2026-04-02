import { apiInitializer } from "discourse/lib/api";

export default apiInitializer((api) => {
  const settings = api.container.lookup("service:site-settings");
  const rawSelectors = settings.element_hider_selectors;

  if (!rawSelectors || rawSelectors.length === 0) return;

  const validSelectors = rawSelectors.map((s) => s.trim()).filter(Boolean);
  if (validSelectors.length === 0) return;

  // Рандомный ID — чтобы не было очевидной цели для удаления в DevTools
  const styleId = "_" + Math.random().toString(36).slice(2, 10);
  const css = validSelectors
    .map((s) => `${s} { display: none !important; }`)
    .join("\n");

  function ensureStyleTag() {
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = css;
      document.head.appendChild(style);
    }
  }

  function hideMatchingElements() {
    validSelectors.forEach((selector) => {
      try {
        document.querySelectorAll(selector).forEach((el) => {
          el.style.setProperty("display", "none", "important");
        });
      } catch (_e) {
        // невалидный CSS-селектор — пропускаем без ошибки
      }
    });
  }

  // Первичное применение сразу при инициализации
  ensureStyleTag();
  hideMatchingElements();

  // MutationObserver на <head>: если style-тег удалили — немедленно восстанавливаем
  const headObserver = new MutationObserver(() => ensureStyleTag());
  headObserver.observe(document.head, { childList: true });

  // MutationObserver на <body>: скрываем элементы по мере их появления в DOM
  // (покрывает SPA-рендеринг и динамически добавляемые компоненты)
  const bodyObserver = new MutationObserver((mutations) => {
    const hasAddedNodes = mutations.some((m) => m.addedNodes.length > 0);
    if (hasAddedNodes) {
      hideMatchingElements();
    }
  });
  bodyObserver.observe(document.body, { childList: true, subtree: true });

  // SPA-навигация: переприменяем скрытие при смене страницы
  api.onPageChange(() => {
    ensureStyleTag();
    hideMatchingElements();
  });
});
