/* ==========================================================================
   Landing / Camouflage — інтерактив
   ========================================================================== */
(function () {
    'use strict';

    /* ---------- Слайдери (Swiper) ---------- */
    function initSliders() {
        if (typeof Swiper === 'undefined') return;

        document.querySelectorAll('[data-slider]').forEach(function (el) {
            var name = el.getAttribute('data-slider');
            var dots = document.querySelector('[data-slider-dots="' + name + '"]');

            new Swiper(el, {
                slidesPerView: 'auto',
                spaceBetween: 30,
                grabCursor: true,
                watchOverflow: true,
                threshold: 3,
                a11y: { enabled: true },
                keyboard: { enabled: true, onlyInViewport: true },
                pagination: dots ? {
                    el: dots,
                    clickable: true,
                    bulletClass: 'camo-dots__item',
                    bulletActiveClass: 'is-active'
                } : false
            });
        });
    }

    initSliders();

    /* ---------- Відео ---------- */
    document.querySelectorAll('[data-video]').forEach(function (frame) {
        var btn = frame.querySelector('[data-video-play]');
        var player = frame.querySelector('[data-video-player]');
        if (!btn || !player) return;

        btn.addEventListener('click', function () {
            var source = player.querySelector('source');
            if (!source || !source.getAttribute('src')) return; // джерело ще не підключене
            player.setAttribute('controls', 'controls');
            frame.classList.add('is-playing');
            player.play();
        });

        player.addEventListener('pause', function () {
            if (player.currentTime === 0) frame.classList.remove('is-playing');
        });
    });

    /* ---------- Форма ---------- */
    document.querySelectorAll('.camo-form').forEach(function (form) {
        var status = form.querySelector('[data-form-status]');

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var fields = form.querySelectorAll('[required]');
            var ok = true;

            fields.forEach(function (field) {
                var valid = field.value.trim().length > 0 &&
                    (field.type !== 'tel' || field.value.replace(/\D/g, '').length >= 9);
                field.classList.toggle('is-invalid', !valid);
                if (!valid && ok) { field.focus(); ok = false; }
            });

            if (!ok) {
                if (status) { status.textContent = ''; status.classList.remove('is-visible'); }
                return;
            }

            form.reset();
            if (status) {
                status.textContent = 'Дякуємо! Ми зв’яжемось з вами найближчим часом.';
                status.classList.add('is-visible');
            }
        });

        form.querySelectorAll('[required]').forEach(function (field) {
            field.addEventListener('input', function () {
                field.classList.remove('is-invalid');
            });
        });
    });

    /* ---------- Плавний перехід до якорів ---------- */
    document.querySelectorAll('.camo a[href^="#"]').forEach(function (link) {
        link.addEventListener('click', function (e) {
            var target = document.querySelector(link.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
})();
