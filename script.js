(() => {
"use strict";
const cards=[...document.querySelectorAll(".style-card")];
const filters=[...document.querySelectorAll(".filter-button")];
const search=document.getElementById("style-search");
const hairGrid=document.getElementById("hair-grid"),beardGrid=document.getElementById("beard-grid");
const hairLoad=document.getElementById("hair-load-more"),beardLoad=document.getElementById("beard-load-more");
const noResults=document.getElementById("no-results"),count=document.getElementById("result-count");
const clear=document.getElementById("clear-search"),showAll=document.getElementById("show-all");
const dialog=document.getElementById("image-viewer"),image=document.getElementById("viewer-image"),caption=document.getElementById("viewer-caption");
const close=document.getElementById("viewer-close"),prev=document.getElementById("viewer-prev"),next=document.getElementById("viewer-next"),barber=document.getElementById("barber-mode");
const PAGE_SIZE=24;let filter="all",matches=[],visibleCount={hair:PAGE_SIZE,beard:PAGE_SIZE},index=0,opener=null,searchTimer=0,touchX=0,touchY=0,wakeLock=null;
const norm=s=>(s||"").toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const isBeard=c=>c.dataset.category==="beard";
function category(c){if(isBeard(c))return"beard";const name=norm(c.dataset.name+" "+c.textContent);if(/curly|wavy/.test(name))return"curly";return c.dataset.category==="skin"||/fade|taper/.test(norm(c.dataset.name))?"skin":"texture";}
function filtered(){const q=norm(search.value.trim());return cards.filter(c=>{const img=c.querySelector("img");const text=norm([c.dataset.name,c.querySelector("h4")?.textContent,c.querySelector(".style-info p")?.textContent,img?.alt].join(" "));return(!q||text.includes(q))&&(filter==="all"||category(c)===filter);});}
function paint(){matches=filtered();const hair=matches.filter(c=>!isBeard(c)),beard=matches.filter(isBeard);const visibleHair=hair.slice(0,visibleCount.hair),visibleBeard=beard.slice(0,visibleCount.beard);cards.forEach(c=>{const list=isBeard(c)?visibleBeard:visibleHair;c.hidden=!list.includes(c);});
hairGrid.hidden=hair.length===0;beardGrid.closest(".beard-section").hidden=beard.length===0;
hairLoad.hidden=hair.length<=visibleHair.length;beardLoad.hidden=beard.length<=visibleBeard.length;
hairLoad.textContent="Load "+Math.min(PAGE_SIZE,hair.length-visibleHair.length)+" more haircuts ("+visibleHair.length+" of "+hair.length+")";
beardLoad.textContent="Load "+Math.min(PAGE_SIZE,beard.length-visibleBeard.length)+" more beard & moustache styles ("+visibleBeard.length+" of "+beard.length+")";
noResults.hidden=matches.length>0;count.textContent=matches.length+" matching "+(matches.length===1?"style":"styles")+" · "+hair.length+" haircuts · "+beard.length+" beard & moustache";
filters.forEach(b=>{const active=b.dataset.filter===filter;b.classList.toggle("active",active);b.setAttribute("aria-pressed",String(active));});
if(dialog.open)syncNav();}
function syncNav(){prev.disabled=index<=0;next.disabled=index>=matches.length-1;prev.setAttribute("aria-disabled",String(prev.disabled));next.setAttribute("aria-disabled",String(next.disabled));}
function showCard(c){opener=c.querySelector(".style-image");index=matches.indexOf(c);render();if(!dialog.open)dialog.showModal();document.body.classList.add("viewer-open");close.focus();}
function render(){const c=matches[index];if(!c)return;const img=c.querySelector("img"),button=c.querySelector(".style-image");image.src=button.dataset.src||img.src;image.alt=img.alt||c.dataset.name||"Style reference";caption.replaceChildren();const strong=document.createElement("strong");strong.id="viewer-dialog-title";strong.className="viewer-caption-title";strong.textContent=c.querySelector("h4")?.textContent.trim()||"Style reference";const detail=document.createElement("span");detail.className="viewer-caption-detail";detail.textContent=c.querySelector(".style-info p")?.textContent.trim()||"Show this reference to your barber.";caption.append(strong,detail);dialog.setAttribute("aria-label",strong.textContent);syncNav();}
function move(delta){const target=index+delta;if(target<0||target>=matches.length)return;index=target;render();}
function loadMore(kind){visibleCount[kind]+=PAGE_SIZE;paint();}
cards.forEach(c=>{const button=c.querySelector(".style-image"),img=c.querySelector("img");if(!button||!img)return;button.setAttribute("aria-label",(c.querySelector("h4")?.textContent||"Style")+", open full-size reference");img.loading="lazy";img.decoding="async";img.addEventListener("error",()=>{img.dataset.loadError="true";c.classList.add("image-failed");},{once:true});img.addEventListener("load",()=>c.classList.remove("image-failed"),{once:true});button.addEventListener("click",()=>showCard(c));});
filters.forEach(b=>b.addEventListener("click",()=>{filter=b.dataset.filter;visibleCount={hair:PAGE_SIZE,beard:PAGE_SIZE};paint();}));
search.addEventListener("input",()=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>{visibleCount={hair:PAGE_SIZE,beard:PAGE_SIZE};paint();},140);});
search.addEventListener("keydown",e=>{if(e.key==="Escape"&&search.value){search.value="";visibleCount={hair:PAGE_SIZE,beard:PAGE_SIZE};paint();}});
hairLoad.addEventListener("click",()=>loadMore("hair"));beardLoad.addEventListener("click",()=>loadMore("beard"));
clear?.addEventListener("click",()=>{search.value="";filter="all";visibleCount={hair:PAGE_SIZE,beard:PAGE_SIZE};paint();search.focus();});
showAll?.addEventListener("click",()=>{search.value="";filter="all";visibleCount={hair:PAGE_SIZE,beard:PAGE_SIZE};paint();});
document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();search.focus();}if(dialog.open){if(e.key==="ArrowLeft"){e.preventDefault();move(-1);}if(e.key==="ArrowRight"){e.preventDefault();move(1);}}});
close.addEventListener("click",()=>dialog.close());prev.addEventListener("click",()=>move(-1));next.addEventListener("click",()=>move(1));
dialog.addEventListener("close",()=>{document.body.classList.remove("viewer-open");barber.setAttribute("aria-pressed","false");dialog.classList.remove("barber-mode");if(wakeLock){wakeLock.release().catch(()=>{});wakeLock=null;}if(opener?.isConnected)opener.focus();});
dialog.addEventListener("pointerdown",e=>{touchX=e.clientX;touchY=e.clientY;},{passive:true});
dialog.addEventListener("pointerup",e=>{const dx=e.clientX-touchX,dy=e.clientY-touchY;if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.2)move(dx<0?1:-1);},{passive:true});
barber.addEventListener("click",async()=>{const enabled=barber.getAttribute("aria-pressed")!=="true";barber.setAttribute("aria-pressed",String(enabled));dialog.classList.toggle("barber-mode",enabled);if(enabled&&"wakeLock"in navigator){try{wakeLock=await navigator.wakeLock.request("screen");}catch(_){}}else if(wakeLock){await wakeLock.release().catch(()=>{});wakeLock=null;}});
image.addEventListener("error",()=>{image.alt="Image unavailable";caption.textContent="This image could not be loaded. Close and choose another reference.";});
paint();
})();