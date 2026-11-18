document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('themeToggle');

  // Load current setting
  chrome.storage.sync.get({ enabled: true }, (data) => {
    toggle.checked = data.enabled !== false;
  });

  // Save new setting on change
  toggle.addEventListener('change', () => {
    chrome.storage.sync.set({ enabled: toggle.checked });
  });
});
