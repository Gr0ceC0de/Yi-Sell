   
CLASSIFIED.JS - FIX ICONOS NO CARGAN - VANILLA LIMPIO
document.addEventListener('DOMContentLoaded', function() {
  const EMOJIS_BASE = ["🍷","🏖️","🐖","🐑","🦌","🦒","🐒","🦢","🦜","🦭","🍕","🍟","🥫","🍝","🍮","🍰","🎂","🍦","⛽","🛴","🚗","🛵","🚓","🚄","🚑","🚌","🚃","🚘","🎢","🛩️","🗽","🧳","⛸️","🏑","🛹","🎯","🏹","🎱","👾","🌼","🪺","🔥","🌊","☔","🌈","⚡","🌩️","🌦️","🌳","🏠","🚂","✈️","🍔","🌮","🍩","🥤","🏨","🏪","🎪","🚀","🌴","🏄","🚲"];
  const EMOJIS_PEOPLE = ["🧑‍🍳","🧑‍🏫","🧑‍💻","🧑‍🔧","🧑‍🦽","🧗","🚵","🧚","🤽","🏊","🧟","🧑‍🚀","🧑‍🏭","🛀"];

  const emojiLayer = document.getElementById('emojiLayer');
  const grid = document.getElementById('classifiedsGrid');
  const foundBadge = document.getElementById('foundBadge');
  const hintBtn = document.getElementById('hintBtn');
  const resetBtn = document.getElementById('resetBtn');
  const searchInput = document.getElementById('searchInput');
  const cityBtns = document.querySelectorAll('.city-btn');
  const adBoxes = document.querySelectorAll('.ad-box');

  console.log('CLASSIFIED JS loaded - emojiLayer:', !!emojiLayer, 'adBoxes:', adBoxes.length);

  function buildCity(){
    if(!emojiLayer){
      console.warn('emojiLayer not found');
      return;
    }
    emojiLayer.innerHTML='';
    const isMobile = window.innerWidth < 640;
    const count = isMobile ? 110 : 210;
    for(let i=0;i<count;i++){
      const el = document.createElement('div');
      const isPerson = Math.random() < 0.25;
      el.className = 'emoji-item' + (isPerson ? ' person' : '');
      el.textContent = isPerson ? EMOJIS_PEOPLE[Math.floor(Math.random()*EMOJIS_PEOPLE.length)] : EMOJIS_BASE[Math.floor(Math.random()*EMOJIS_BASE.length)];
      el.style.left = (Math.random()*100)+'%';
      el.style.top = (Math.random()*100)+'%';
      el.style.fontSize = (12 + Math.random()*28)+'px';
      el.style.transform = 'translate(-50%,-50%) rotate(' + ((Math.random()-0.5)*36) + 'deg)';
      el.style.opacity = isPerson ? '0' : (0.32 + Math.random()*0.58);
      el.style.animationDelay = (Math.random()*7)+'s';
      emojiLayer.appendChild(el);
    }
  }

  // Iniciar ciudad
  buildCity();
  window.addEventListener('resize', buildCity);

  // Game logic
  let foundCount = 0;
  let hints = 3;

  function updateBadge(){
    if(!foundBadge) return;
    foundBadge.textContent = 'Found: ' + foundCount + '/' + adBoxes.length;
    if(foundCount===adBoxes.length){
      foundBadge.textContent = 'All Found! ' + foundCount + '/' + adBoxes.length;
      foundBadge.style.background = '#ff2a9d';
    }
  }

  adBoxes.forEach(function(box){
    box.addEventListener('click', function(){
      if(!box.classList.contains('found')){
        box.classList.add('found');
        foundCount++;
        updateBadge();
        if(navigator.vibrate) navigator.vibrate(30);
      }
    });
  });

  if(resetBtn){
    resetBtn.addEventListener('click', function(){
      adBoxes.forEach(function(b){ b.classList.remove('found'); });
      foundCount=0; hints=3;
      if(hintBtn) hintBtn.textContent = 'HINT ' + hints + '/3';
      updateBadge();
      buildCity();
    });
  }

  if(hintBtn){
    hintBtn.addEventListener('click', function(){
      if(hints<=0) return;
      const notFound = Array.from(adBoxes).filter(function(b){ return !b.classList.contains('found') && !b.classList.contains('hidden-filter'); });
      if(notFound.length===0) return;
      const rnd = notFound[Math.floor(Math.random()*notFound.length)];
      rnd.classList.add('hint-pulse');
      rnd.scrollIntoView({behavior:'smooth', block:'center'});
      setTimeout(function(){ rnd.classList.remove('hint-pulse'); },2200);
      hints--;
      hintBtn.textContent = 'HINT ' + hints + '/3';
    });
  }

  cityBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      const city = btn.dataset.city;
      cityBtns.forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      adBoxes.forEach(function(box){
        const match = (city==='all' || box.dataset.city===city);
        box.classList.toggle('hidden-filter', !match);
      });
    });
  });

  if(searchInput){
    searchInput.addEventListener('input', function(e){
      const q = e.target.value.toLowerCase().trim();
      adBoxes.forEach(function(box){
        const txt = box.innerText.toLowerCase();
        box.classList.toggle('hidden-filter', q && txt.indexOf(q)===-1);
      });
    });
  }

  updateBadge();
});