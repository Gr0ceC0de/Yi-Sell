/* ============================================================
   CLASSIFIEDS.JS
   Vanilla JS puro. Sin fetch externo. Sin CDN.
   Índice:
   01. Utilidades
   02. Selector de ciudad SOLO para CARD 002 (Apartments)
   03. Búsqueda global
   04. Contador "Found"
   05. Botón Reset
   06. Botón Hint
   07. Acciones DETAILS / BUY
   08. Carga opcional de header/footer locales
   ============================================================ */

(function () {
    'use strict';

    /* ------------------------------------------------------------
       01. UTILIDADES
       ------------------------------------------------------------ */
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    /* ------------------------------------------------------------
       02. SELECTOR DE CIUDAD — SOLO CARD 002 (APARTMENTS)
       ------------------------------------------------------------
       Al pulsar una ciudad, se actualiza:
         - la clase .active del botón
         - el atributo data-city de la card (para futuros filtros)
         - la etiqueta .city-tag (ej: [CCS] CARACAS)
       ------------------------------------------------------------ */
    const apartmentCard = document.getElementById('card-apartments');
    const apartmentCityTag = document.getElementById('apartmentCityTag');
    const apartmentCityBtns = $$('.apt-city-btn');

    if (apartmentCard && apartmentCityTag && apartmentCityBtns.length) {
        apartmentCityBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const newCity = btn.dataset.aptCity;
                const newLabel = btn.dataset.aptLabel;

                // Actualizar estado visual
                apartmentCityBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Actualizar data-city de la card
                apartmentCard.dataset.city = newCity;

                // Actualizar etiqueta visible
                apartmentCityTag.textContent = newLabel;
            });
        });
    }

    /* ------------------------------------------------------------
       03. BÚSQUEDA GLOBAL
       ------------------------------------------------------------ */
    const adBoxes = $$('.ad-box');
    const searchInput = $('#searchInput');

    if (searchInput) {
        searchInput.addEventListener('input', e => {
            const q = e.target.value.toLowerCase().trim();
            adBoxes.forEach(box => {
                const txt = box.innerText.toLowerCase();
                box.classList.toggle('hidden-filter', !!q && !txt.includes(q));
            });
        });
    }

    /* ------------------------------------------------------------
       04. CONTADOR "FOUND"
       ------------------------------------------------------------ */
    const foundBadge = $('#foundBadge');
    let foundCount = 0;

    function updateBadge() {
        if (!foundBadge) return;
        foundBadge.textContent = `✓ Found: ${foundCount}/${adBoxes.length}`;
        if (foundCount === adBoxes.length && adBoxes.length > 0) {
            foundBadge.textContent = `🎉 All Found! ${foundCount}/${adBoxes.length}`;
            foundBadge.style.background = '#C08081';
            foundBadge.style.color = '#F5F5F0';
        }
    }

    adBoxes.forEach(box => {
        box.addEventListener('click', e => {
            // Ignorar clicks en botones de acción o en el selector de ciudad
            if (e.target.closest('[data-action]')) return;
            if (e.target.closest('.apartment-city-selector')) return;

            if (!box.classList.contains('found')) {
                box.classList.add('found');
                foundCount++;
                updateBadge();
                if (navigator.vibrate) navigator.vibrate(30);
            }
        });
    });

    /* ------------------------------------------------------------
       05. BOTÓN RESET
       ------------------------------------------------------------ */
    const resetBtn = $('#resetBtn');
    let hints = 3;
    const hintBtn = $('#hintBtn');

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            adBoxes.forEach(b => {
                b.classList.remove('found');
                b.classList.remove('hidden-filter');
            });
            foundCount = 0;
            hints = 3;
            if (hintBtn) hintBtn.textContent = `💡 Hint (${hints}/3)`;
            if (foundBadge) {
                foundBadge.style.background = '';
                foundBadge.style.color = '';
            }
            updateBadge();
        });
    }

    /* ------------------------------------------------------------
       06. BOTÓN HINT
       ------------------------------------------------------------ */
    if (hintBtn) {
        hintBtn.addEventListener('click', () => {
            if (hints <= 0) return;
            const notFound = adBoxes.filter(
                b => !b.classList.contains('found') &&
                     !b.classList.contains('hidden-filter')
            );
            if (notFound.length === 0) return;
            const rnd = notFound[Math.floor(Math.random() * notFound.length)];
            rnd.classList.add('hint-pulse');
            rnd.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => rnd.classList.remove('hint-pulse'), 2200);
            hints--;
            hintBtn.textContent = `💡 Hint (${hints}/3)`;
        });
    }

    /* ------------------------------------------------------------
       07. ACCIONES DETAILS / BUY
       ------------------------------------------------------------ */
    document.addEventListener('click', e => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const boxNum = btn.dataset.box;
        const action = btn.dataset.action;

        if (action === 'detail') {
            alert(
                `BOX ${boxNum} DETAILS\n\n` +
                `This is a fantasy business simulation listing.\n\n` +
                `In production: Modal with full specs, pricing tiers, and affiliate terms.\n\n` +
                `Category reservation: $100/mo\n` +
                `Premium 12-mo lock available.`
            );
        } else if (action === 'buy') {
            alert(
                `BOX ${boxNum} INQUIRY\n\n` +
                `This is a digital economy simulation.\n\n` +
                `In production: Secure checkout + affiliate onboarding.\n\n` +
                `Contact: classifieds@trading.assistant\n` +
                `Subject: Box ${boxNum} Reservation`
            );
        }
    });

    /* ------------------------------------------------------------
       08. CARGA OPCIONAL DE HEADER / FOOTER LOCALES
       ------------------------------------------------------------ */
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        fetch('header.html')
            .then(res => (res.ok ? res.text() : ''))
            .then(html => { if (html) headerPlaceholder.innerHTML = html; })
            .catch(() => { /* silencio: sin servidor local */ });
    }

    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        fetch('footer.html')
            .then(res => (res.ok ? res.text() : ''))
            .then(html => { if (html) footerPlaceholder.innerHTML = html; })
            .catch(() => { /* silencio: sin servidor local */ });
    }

    /* ------------------------------------------------------------
       INIT
       ------------------------------------------------------------ */
    updateBadge();

})();