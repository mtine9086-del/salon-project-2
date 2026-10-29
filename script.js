(() => {
  const cards = [...document.querySelectorAll(".style-card")];
  const filterButtons = [...document.querySelectorAll(".filter-button")];
  const viewButtons = [...document.querySelectorAll(".view-button")];
  const grid = document.getElementById("hair-grid");
  const searchInput = document.getElementById("style-search");
  const noResults = document.getElementById("no-results");
  const resultCount = document.getElementById("result-count");
  const viewer = document.getElementById("image-viewer");
  const viewerImage = document.getElementById("viewer-image");
  const viewerCaption = document.getElementById("viewer-caption");
  const closeButton = document.getElementById("viewer-close");
  const prevButton = document.getElementById("viewer-prev");
  const nextButton = document.getElementById("viewer-next");
  let activeFilter = "all", currentIndex = 0, startX = 0, startY = 0, pointerId = null;
  function visibleCards() { return cards.filter(card => !card.hidden); }
  function updateCards() {
    const query = searchInput.value.trim().toLowerCase();
    let count = 0;
    cards.forEach(card => {
      const text = (card.dataset.name + " " + card.querySelector(".style-info p").textContent).toLowerCase();
      const matchesQuery = text.includes(query);
      const matchesFilter = activeFilter === "all" || card.dataset.category === activeFilter;
      card.hidden = !(matchesQuery && matchesFilter);
      if (!card.hidden) count++;
    });
    noResults.hidden = count > 0;
    resultCount.textContent = count + (count === 1 ? " style" : " styles");
  }
  function showCard(card) {
    if (!card) return;
    const visible = visibleCards();
    currentIndex = visible.indexOf(card);
    viewerImage.src = card.querySelector(".style-image").dataset.src;
    viewerImage.alt = card.querySelector("img").alt;
    viewerCaption.textContent = card.querySelector("h4").textContent.replace(/\s+/g, " ").trim();
    if (!viewer.open) viewer.showModal();
  }
  function move(direction) {
    const visible = visibleCards();
    if (!visible.length) return;
    currentIndex = (currentIndex + direction + visible.length) % visible.length;
    showCard(visible[currentIndex]);
  }
  cards.forEach(card => card.querySelector(".style-image").addEventListener("click", () => showCard(card)));
  filterButtons.forEach(button => button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach(b => { const active = b === button; b.classList.toggle("active", active); b.setAttribute("aria-pressed", String(active)); });
    updateCards();
  }));
  viewButtons.forEach(button => button.addEventListener("click", () => {
    const compact = button.dataset.view === "compact";
    grid.classList.toggle("compact", compact);
    viewButtons.forEach(b => { const active = b === button; b.classList.toggle("active", active); b.setAttribute("aria-pressed", String(active)); });
  }));
  searchInput.addEventListener("input", updateCards);
  document.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); searchInput.focus(); }
    if (!viewer.open) return;
    if (e.key === "ArrowLeft") move(-1);
    if (e.key === "ArrowRight") move(1);
    if (e.key === "Escape") viewer.close();
  });
  closeButton.addEventListener("click", () => viewer.close());
  prevButton.addEventListener("click", () => move(-1));
  nextButton.addEventListener("click", () => move(1));
  viewer.addEventListener("pointerdown", e => { if (!viewer.open || e.isPrimary === false || e.button !== 0) return; pointerId = e.pointerId; startX = e.clientX; startY = e.clientY; }, {passive:true});
  viewer.addEventListener("pointerup", e => { if (!viewer.open || pointerId !== e.pointerId) return; const dx = e.clientX - startX, dy = e.clientY - startY; pointerId = null; if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy) * 1.2) move(dx < 0 ? 1 : -1); }, {passive:true});
  viewer.addEventListener("pointercancel", () => { pointerId = null; }, {passive:true});
  viewer.addEventListener("click", e => { if (e.target === viewer) viewer.close(); });
  viewerImage.addEventListener("error", () => { viewerCaption.textContent = "Image could not be loaded."; });
  updateCards();
})();