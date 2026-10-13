   
// CLASSIFIED.JS - Vanilla JS limpio, sin polucion
const EMOJIS_BASE = ["🍷","🏖️","🐖","🐑","🦌","🦒","🐒","🦢","🦜","🦭","🍕","🍟","🥫","🍝","🍮","🍰","🎂","🍦","⛽","🛴","🚗","🛵","🚓","🚄","🚑","🚌","🚃","🚘","🎢","🛩️","🗽","🧳","⛸️","🏑","🛹","🎯","🏹","🎱","👾","🌼","🪺","🔥","🏖️","🌊","☔","🌈","⚡","🌩️","🌦️","🌳","🏠","🚂","✈️","🍔","🌮","🍩","🥤","🏨","🏪","🎪","🚀","🌴","🏄","🚲","🍷","⛽"];
const EMOJIS_PEOPLE = ["🧑‍🍳","🧑‍🏫","🧑‍💻","🧑‍🔧","🧑‍🦽","🧗","🚵","🧚","🤽","🏊","🧟","🧑‍🚀","🧑‍🏭","👨‍❤️‍💋‍👨","🛀"];
const emojiLayer = document.getElementById('emojiLayer');
const grid = document.getElementById('classifiedsGrid');

function buildCity(){
  if(!emojiLayer) return;
  emojiLayer.innerHTML='';
  const isMobile = window.innerWidth < 640;
  const count = isMobile ? 110 : 210;
  for(let i=0;i<count;i++){
    const span = document.createElement('span');
    const isPerson = Math.random() < 0.22;
    span.className = 'emoji-item' + (isPerson ? ' person' : '');
    span.textContent = isPerson ? EMOJIS_PEOPLE[Math.floor(Math.random()*EMOJIS_PEOPLE.length)] : EMOJIS_BASE[Math.floor(Math.random()*EMOJIS_BASE.length)];
    span.style.left = (Math.random()*100)+'%';
    span.style.top = (Math.random()*100)+'%';
    span.style.fontSize = (12 + Math.random()*26)+'px';
    span.style.transform = `translate(-50%,-50%) rotate(${(Math.random()-0.5)*36}deg)`;
    span.style.opacity = isPerson ? '0' : (0.28 + Math.random()*0.55);
    span.style.animationDelay = (Math.random()*7)+'s';
    emojiLayer.appendChild(span);
  }
}
buildCity();
window.addEventListener('resize', buildCity);

// Game logic
let foundCount = 0;
let hints = 3;
const adBoxes = document.querySelectorAll('.ad-box');
const foundBadge = document.getElementById('foundBadge');
const hintBtn = document.getElementById('hintBtn');
const searchInput = document.getElementById('searchInput');
const cityBtns = document.querySelectorAll('.city-btn');

function updateBadge(){
  foundBadge.textContent = `✓ Found: ${foundCount}/${adBoxes.length}`;
  if(foundCount===adBoxes.length){
    foundBadge.textContent = `🎉 All Found! ${foundCount}/${adBoxes.length}`;
    foundBadge.style.background = '#ff2a9d';
  }
}
adBoxes.forEach(box=>{
  box.addEventListener('click', ()=>{
    if(!box.classList.contains('found')){
      box.classList.add('found');
      foundCount++;
      updateBadge();
      if(navigator.vibrate) navigator.vibrate(30);
    }
  });
});
document.getElementById('resetBtn').addEventListener('click', ()=>{
  adBoxes.forEach(b=>b.classList.remove('found'));
  foundCount=0; hints=3;
  if(hintBtn) hintBtn.textContent = `💡 Hint (${hints}/3)`;
  updateBadge();
  buildCity();
});
if(hintBtn){
  hintBtn.addEventListener('click', ()=>{
    if(hints<=0) return;
    const notFound = [...adBoxes].filter(b=>!b.classList.contains('found') && !b.classList.contains('hidden-filter'));
    if(notFound.length===0) return;
    const rnd = notFound[Math.floor(Math.random()*notFound.length)];
    rnd.classList.add('hint-pulse');
    rnd.scrollIntoView({behavior:'smooth', block:'center'});
    setTimeout(()=>rnd.classList.remove('hint-pulse'),2200);
    hints--;
    hintBtn.textContent = `💡 Hint (${hints}/3)`;
  });
}
cityBtns.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const city = btn.dataset.city;
    cityBtns.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    adBoxes.forEach(box=>{
      box.classList.toggle('hidden-filter', !(city==='all' || box.dataset.city===city));
    });
  });
});
if(searchInput){
  searchInput.addEventListener('input', (e)=>{
    const q = e.target.value.toLowerCase().trim();
    adBoxes.forEach(box=>{
      const txt = box.innerText.toLowerCase();
      box.classList.toggle('hidden-filter', q && !txt.includes(q));
    });
  });
}
