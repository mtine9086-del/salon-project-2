(() => {
  const cards = [...document.querySelectorAll(".style-card")];
  const filters = [...document.querySelectorAll(".filter-button")];
  const search = document.getElementById("style-search");
  const hairGrid = document.getElementById("hair-grid");
  const hairHeading = document.querySelector("#catalogue .category-heading");
  const hairNote = document.querySelector("#catalogue .image-note");
  const beardSection = document.getElementById("beard-catalogue");
  const beardGrid = document.getElementById("beard-grid");
  const noResults = document.getElementById("no-results");
  const count = document.getElementById("result-count");
  const clearSearch = document.getElementById("clear-search");
  const showAll = document.getElementById("show-all");
  const dialog = document.getElementById("image-viewer");
  const image = document.getElementById("viewer-image");
  const caption = document.getElementById("viewer-caption");
  const close = document.getElementById("viewer-close");
  const prev = document.getElementById("viewer-prev");
  const next = document.getElementById("viewer-next");
  const barberMode = document.getElementById("barber-mode");
  let filter = "all", shown = [], index = 0, opener = null, timer = 0, startX = 0, startY = 0;
  const norm = value => (value || "").toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  const groupFor = card => card.dataset.category === "beard" ? "beard" :
    /curly|wavy/.test(norm(card.dataset.name + " " + card.textContent)) ? "curly" :
    /fade|taper/.test(norm(card.dataset.name)) ? "skin" : "texture";
  function update() {
    const query = norm(search.value.trim());
    shown = cards.filter(card => {
      const haystack = norm([card.dataset.name, card.querySelector("h4")?.textContent, card.querySelector(".style-info p")?.textContent, card.querySelector("img")?.alt].join(" "));
      const matches = (!query || haystack.includes(query)) && (filter === "all" || groupFor(card) === filter);
      card.hidden = !matches;
      return matches;
    });
    const hairVisible = shown.some(card => card.dataset.category !== "beard");
    const beardVisible = shown.some(card => card.dataset.category === "beard");
    hairGrid.hidden = !hairVisible;
    hairHeading.hidden = !hairVisible;
    hairNote.hidden = !hairVisible;
    beardSection.hidden = !beardVisible;
    noResults.hidden = shown.length !== 0;
    count.textContent = shown.length + (shown.length === 1 ? " style found" : " styles found");
    filters.forEach(button => {
      const active = button.dataset.filter === filter;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
      const n = cards.filter(card => filterMatches(card, button.dataset.filter)).length;
      button.dataset.count = String(n);
    });
    if (dialog.open && shown[index]) syncNavigation();
  }
  function filterMatches(card, key) { return key === "all" || groupFor(card) === key; }
  function syncNavigation() {
    prev.disabled = index <= 0;
    next.disabled = index >= shown.length - 1;
    prev.setAttribute("aria-disabled", String(prev.disabled));
    next.setAttribute("aria-disabled", String(next.disabled));
  }
  function openCard(card) {
    opener = card.querySelector(".style-image");
    shown = cards.filter(item => !item.hidden);
    index = shown.indexOf(card);
    render();
    if (!dialog.open) dialog.showModal();
    close.focus();
    document.body.classList.add("viewer-open");
  }
  function render() {
    const card = shown[index];
    if (!card) return;
    const title = card.querySelector("h4")?.textContent.trim() || "Style reference";
    const img = card.querySelector("img");
    image.src = card.querySelector(".style-image").dataset.src || img.src;
    image.alt = img.alt || title;
    caption.replaceChildren();
    const heading = document.createElement("strong");
    heading.id = "viewer-dialog-title";
    heading.className = "viewer-caption-title";
    heading.textContent = title;
    const detail = document.createElement("span");
    detail.className = "viewer-caption-detail";
    detail.textContent = card.querySelector(".style-info p")?.textContent.trim() || "Show this reference to your barber.";
    caption.append(heading, detail);
    syncNavigation();
    dialog.setAttribute("aria-label", title);
  }
  function move(delta) {
    const target = index + delta;
    if (target < 0 || target >= shown.length) return;
    index = target; render();
  }
  function closeViewer() {
    if (dialog.open) dialog.close();
  }
  cards.forEach(card => {
    const button = card.querySelector(".style-image");
    if (!button) return;
    button.setAttribute("aria-label", (card.querySelector("h4")?.textContent || "Style") + ", open full size");
    const img = card.querySelector("img");
    if (img && img !== document.querySelector(".hero-photo img")) {
      img.loading = card.closest("#hair-grid") && card === cards[0] ? "eager" : "lazy";
      img.decoding = "async";
    }
    button.addEventListener("click", () => openCard(card));
  });
  filters.forEach(button => button.addEventListener("click", () => { filter = button.dataset.filter; update(); }));
  search.addEventListener("input", () => { window.clearTimeout(timer); timer = window.setTimeout(update, 150); });
  search.addEventListener("keydown", event => { if (event.key === "Escape" && search.value) { search.value = ""; update(); } });
  clearSearch?.addEventListener("click", () => { search.value = ""; filter = "all"; update(); search.focus(); });
  showAll?.addEventListener("click", () => { search.value = ""; filter = "all"; update(); });
  document.addEventListener("keydown", event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); search.focus(); }
    if (!dialog.open) return;
    if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
    if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
  });
  close.addEventListener("click", closeViewer);
  prev.addEventListener("click", () => move(-1));
  next.addEventListener("click", () => move(1));
  dialog.addEventListener("close", () => {
    document.body.classList.remove("viewer-open");
    barberMode.setAttribute("aria-pressed","false");
    dialog.classList.remove("barber-mode");
    if (opener?.isConnected) opener.focus();
  });
  dialog.addEventListener("pointerdown", event => { startX = event.clientX; startY = event.clientY; }, {passive:true});
  dialog.addEventListener("pointerup", event => {
    const dx = event.clientX - startX, dy = event.clientY - startY;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.25) move(dx < 0 ? 1 : -1);
  }, {passive:true});
  barberMode.addEventListener("click", () => {
    const enabled = barberMode.getAttribute("aria-pressed") !== "true";
    barberMode.setAttribute("aria-pressed", String(enabled));
    dialog.classList.toggle("barber-mode", enabled);
    if (enabled && "wakeLock" in navigator) navigator.wakeLock.request("screen").catch(() => {});
  });
  image.addEventListener("error", () => { image.alt = "Image unavailable"; caption.textContent = "Image unavailable. Please try another reference."; });
  update();
})();