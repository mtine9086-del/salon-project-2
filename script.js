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
    const styleName = card.querySelector("h4").textContent.replace(/\\s+/g, " ").trim();
    const styleCopy = {
      "Burst Fade": ["Make every angle count.", "A rounded, ear-focused fade adds bold definition while keeping the overall look clean."],
      "Comb Over Fade": ["Classic polish. Modern edge.", "A side-swept finish paired with faded sides delivers a sharp, versatile look."],
      "Curly Top Fade": ["Let your texture do the talking.", "Show off natural curls with crisp faded sides for a confident, balanced finish."],
      "Textured Crop": ["Effortless texture. Standout style.", "A textured top and clean sides create a modern look that's easy to wear."],
      "Modern Quiff Fade": ["Own the room with extra lift.", "Volume through the front and a clean fade bring energy to this polished style."],
      "French Crop": ["Clean, confident, no-fuss.", "A short textured top and forward fringe make this cut stylish and easy to maintain."],
      "Slick Back Undercut": ["Sleek lines. Strong presence.", "A longer top brushed back over shorter sides creates a bold, refined finish."],
      "Messy Fringe": ["Relaxed look. Serious style.", "Natural-looking movement and a textured fringe give this cut a cool, effortless feel."],
      "Side Part Fade": ["Timeless style, freshly sharpened.", "A defined part and smooth fade make this a smart choice from everyday wear to special occasions."],
      "Pompadour Fade": ["Big volume. Clean finish.", "A lifted front and tapered sides create a statement look with a refined silhouette."],
      "Crew Cut Fade": ["Simple, sharp, always in style.", "A neat short top with faded sides keeps the look crisp, practical and confident."],
      "Spiky Textured Cut": ["Add edge to your everyday look.", "Separated texture and a dynamic top create a fresh, youthful finish."],
      "Buzz Cut Fade": ["Minimal effort. Maximum sharpness.", "A close-cut top with faded sides gives you a clean, bold style with easy upkeep."],
      "High and Tight": ["Crisp, neat, and built to stand out.", "Close sides and a compact top deliver a strong, clean-cut appearance."],
      "Low Taper": ["Subtle detail. Elevated style.", "A gentle taper around the temples and neckline keeps the finish natural and polished."],
      "Mid Fade": ["The perfect balance of bold and classic.", "A balanced fade creates clean contrast without taking attention away from the top."],
      "High Fade": ["High contrast. High impact.", "A fade that starts higher on the sides gives the haircut a bold, modern shape."],
      "Drop Fade": ["A smooth curve that changes the whole look.", "The fade follows the head's natural shape for a distinctive, clean finish."],
      "Faux Hawk Fade": ["Bring the focus to the centre.", "A raised centre and shorter sides add shape, movement and a confident edge."],
      "Curly Fringe Fade": ["Curls up front. Clean lines all around.", "Defined curls fall forward while faded sides keep the overall silhouette fresh."],
      "Textured Quiff": ["Natural movement, styled with intent.", "A lifted front and textured finish add dimension without looking overly formal."],
      "Classic Side Part": ["A timeless cut that always delivers.", "A neat side part gives you a polished look that works for everyday and formal occasions."],
      "Modern Mullet Fade": ["A bold shape with a modern finish.", "Longer length at the back meets faded sides for a distinctive, fashion-forward look."],
      "Tapered Afro": ["Celebrate texture with a clean outline.", "Natural volume and carefully tapered edges create a balanced, defined finish."],
      "Shadow Fade": ["A subtle blend. A seriously sharp finish.", "Soft, gradual fading creates a natural shadow effect without harsh skin-level contrast."]
    };
    const copy = styleCopy[styleName] || ["Find the look that feels like you.", "A fresh, well-shaped cut can bring your whole look together. Ask your barber to tailor the finish to your hair and preference."];
    viewerCaption.innerHTML = "";
    const title = document.createElement("strong");
    title.className = "viewer-caption-title";
    title.textContent = styleName + " Haircut";
    const hook = document.createElement("span");
    hook.className = "viewer-caption-hook";
    hook.textContent = copy[0];
    const detail = document.createElement("span");
    detail.className = "viewer-caption-detail";
    detail.textContent = copy[1];
    viewerCaption.append(title, hook, detail);
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