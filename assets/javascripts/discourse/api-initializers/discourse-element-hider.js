import { apiInitializer } from "discourse/lib/api";

export default apiInitializer((api) => {
  const settings = api.container.lookup("service:site-settings");
  const rawSelectors = settings.element_hider_selectors;

  if (!rawSelectors || rawSelectors.length === 0) return;

  const validSelectors = (
    Array.isArray(rawSelectors)
      ? rawSelectors
      : String(rawSelectors).split("|")
  )
    .map((s) => s.trim())
    .filter(Boolean);

  if (validSelectors.length === 0) return;

  function removeMatchingElements() {
    validSelectors.forEach((selector) => {
      try {
        document.querySelectorAll(selector).forEach((el) => el.remove());
      } catch (_e) {}
    });
  }

  removeMatchingElements();

  const bodyObserver = new MutationObserver((mutations) => {
    const hasAddedNodes = mutations.some((m) => m.addedNodes.length > 0);
    if (hasAddedNodes) {
      removeMatchingElements();
    }
  });
  bodyObserver.observe(document.body, { childList: true, subtree: true });

  api.onPageChange(() => removeMatchingElements());
});
