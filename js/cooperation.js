/* ==========================================================================
   Співпраця — інтерактив
   ========================================================================== */
(function () {
    'use strict';

    /* ---------- Акордеон FAQ ---------- */
    document.querySelectorAll('[data-accordion]').forEach(function (root) {
        var items = Array.prototype.slice.call(root.querySelectorAll('.accordion__item'));

        function toggle(item, open) {
            var trigger = item.querySelector('.accordion__trigger');
            var panel = item.querySelector('.accordion__panel');
            if (!trigger || !panel) return;
            item.classList.toggle('is-open', open);
            trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
            panel.hidden = !open;
        }

        items.forEach(function (item) {
            var trigger = item.querySelector('.accordion__trigger');
            if (!trigger) return;

            trigger.addEventListener('click', function () {
                var willOpen = !item.classList.contains('is-open');
                items.forEach(function (other) { toggle(other, false); });
                toggle(item, willOpen);
            });
        });
    });

    /* ---------- Карта присутності (Google Maps JavaScript API) ----------
       Ключ береться з data-map-key. Якщо ключа немає або API не завантажилось —
       лишається запасний iframe-ембед, тож блок ніколи не буває порожнім. */
    (function initMap() {
        var root = document.querySelector('[data-map]');
        if (!root) return;

        var key = (root.getAttribute('data-map-key') || '').trim();
        var canvas = root.querySelector('[data-map-canvas]');
        var fallback = root.querySelector('[data-map-fallback]');
        if (!key || !canvas) return;

        var points;
        try {
            points = JSON.parse(root.getAttribute('data-map-points') || '[]');
        } catch (e) {
            points = [];
        }
        if (!points.length) return;

        function useFallback() {
            canvas.hidden = true;
            if (fallback) fallback.hidden = false;
        }

        /* невалідний ключ / перевищений ліміт — Google викликає цей глобальний хук */
        window.gm_authFailure = useFallback;

        window.initCoopMap = function () {
            if (!window.google || !window.google.maps) { useFallback(); return; }

            canvas.hidden = false;
            if (fallback) fallback.hidden = true;

            var map = new google.maps.Map(canvas, {
                zoom: 6,
                center: { lat: 49.4, lng: 31 },
                gestureHandling: 'cooperative', /* колесо миші не перехоплює скрол сторінки */
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: true
            });

            var icon = {
                url: 'img/cooperation/pin.svg',
                scaledSize: new google.maps.Size(25.649, 42),
                anchor: new google.maps.Point(12.82, 42)
            };
            var info = new google.maps.InfoWindow();
            var bounds = new google.maps.LatLngBounds();

            points.forEach(function (point) {
                var position = { lat: point.lat, lng: point.lng };
                var marker = new google.maps.Marker({
                    position: position,
                    map: map,
                    icon: icon,
                    title: point.title
                });
                bounds.extend(position);

                marker.addListener('click', function () {
                    info.setContent(
                        '<div class="coop-map__popup">' +
                        '<p class="coop-map__popup-title">' + point.title + '</p>' +
                        (point.address ? '<p class="coop-map__popup-text">' + point.address + '</p>' : '') +
                        '</div>'
                    );
                    info.open({ anchor: marker, map: map });
                });
            });

            if (points.length > 1) {
                map.fitBounds(bounds, { top: 80, right: 80, bottom: 80, left: 80 });
            } else {
                map.setCenter(bounds.getCenter());
            }
        };

        var script = document.createElement('script');
        script.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(key) +
            '&callback=initCoopMap&language=uk&region=UA&loading=async';
        script.async = true;
        script.onerror = useFallback;
        document.head.appendChild(script);
    })();

    /* ---------- Форма ---------- */
    document.querySelectorAll('.contact-form').forEach(function (form) {
        var status = form.querySelector('[data-form-status]');

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var ok = true;

            form.querySelectorAll('[required]').forEach(function (field) {
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
})();
