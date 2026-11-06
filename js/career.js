/* ==========================================================================
   Кар'єра — пошук і фільтри вакансій, форма відгуку, модальне вікно
   ========================================================================== */
(function () {
    'use strict';

    var mobileQuery = window.matchMedia('(max-width: 768px)');

    function lockScroll(lock) {
        document.body.classList.toggle('no-scroll', lock);
    }

    /* ---------- Пошук і фільтри вакансій ---------- */
    (function initCareer() {
        var root = document.querySelector('[data-career]');
        if (!root) return;

        var cards = Array.prototype.slice.call(root.querySelectorAll('[data-vacancy]'));
        var empty = root.querySelector('[data-career-empty]');
        var search = root.querySelector('[data-career-search]');
        var panel = root.querySelector('[data-filters]');
        var filters = Array.prototype.slice.call(root.querySelectorAll('[data-filter]'));

        /* застосовані значення фільтрів: { category: [...], location: [...] } */
        var applied = {};
        filters.forEach(function (f) { applied[f.getAttribute('data-filter')] = []; });

        function boxes(filter) {
            return Array.prototype.slice.call(filter.querySelectorAll('input[type="checkbox"]:not([data-filter-all])'));
        }

        /* лічильники та неактивні пункти — рахуємо з реальних карток */
        filters.forEach(function (filter) {
            var key = filter.getAttribute('data-filter');
            var total = filter.querySelector('[data-filter-count="all"]');
            if (total) total.textContent = cards.length;

            boxes(filter).forEach(function (box) {
                var count = cards.filter(function (c) { return c.getAttribute('data-' + key) === box.value; }).length;
                var counter = filter.querySelector('[data-filter-count="' + box.value + '"]');
                if (counter) counter.textContent = count;
                if (!count) {
                    box.disabled = true;
                    box.closest('.filter-item').classList.add('is-disabled');
                }
            });
        });

        function render() {
            var query = search ? search.value.trim().toLowerCase() : '';
            var visible = 0;

            cards.forEach(function (card) {
                var ok = Object.keys(applied).every(function (key) {
                    return !applied[key].length || applied[key].indexOf(card.getAttribute('data-' + key)) !== -1;
                });
                if (ok && query) ok = card.textContent.toLowerCase().indexOf(query) !== -1;
                card.hidden = !ok;
                if (ok) visible++;
            });

            if (empty) empty.hidden = visible > 0;
        }

        function updateLabel(filter) {
            var key = filter.getAttribute('data-filter');
            var label = filter.querySelector('[data-filter-label]');
            var values = applied[key];
            if (!label) return;

            if (!values.length) {
                label.textContent = filter.getAttribute('data-filter-default');
            } else {
                var first = filter.querySelector('input[value="' + values[0] + '"]');
                var name = first ? first.closest('.filter-item').querySelector('.filter-item__name').textContent : '';
                label.textContent = values.length > 1 ? name + ' +' + (values.length - 1) : name;
            }
        }

        /* чекбокс «Всі ...» відмічений, коли не вибрано жодного пункту */
        function syncAll(filter) {
            var all = filter.querySelector('[data-filter-all]');
            if (all) all.checked = !boxes(filter).some(function (b) { return b.checked; });
        }

        /* повертаємо чекбокси до застосованого стану (якщо закрили без «Застосувати») */
        function restore(filter) {
            var key = filter.getAttribute('data-filter');
            boxes(filter).forEach(function (b) { b.checked = applied[key].indexOf(b.value) !== -1; });
            syncAll(filter);
        }

        function setOpen(filter, open) {
            filter.classList.toggle('is-open', open);
            var toggle = filter.querySelector('[data-filter-toggle]');
            if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        }

        function closeAll(except) {
            filters.forEach(function (f) {
                if (f === except || !f.classList.contains('is-open')) return;
                setOpen(f, false);
                if (!mobileQuery.matches) restore(f);
            });
        }

        function openPanel(open) {
            if (!panel) return;
            panel.classList.toggle('is-open', open);
            lockScroll(open);
            if (!open) filters.forEach(function (f) { setOpen(f, false); restore(f); });
        }

        function apply() {
            filters.forEach(function (filter) {
                applied[filter.getAttribute('data-filter')] = boxes(filter)
                    .filter(function (b) { return b.checked; })
                    .map(function (b) { return b.value; });
                updateLabel(filter);
                setOpen(filter, false);
            });
            render();
            if (mobileQuery.matches) openPanel(false);
        }

        function reset() {
            filters.forEach(function (filter) {
                boxes(filter).forEach(function (b) { b.checked = false; });
                syncAll(filter);
                var s = filter.querySelector('[data-filter-search]');
                if (s) { s.value = ''; filterList(filter, ''); }
            });
        }

        function filterList(filter, value) {
            var q = value.trim().toLowerCase();
            filter.querySelectorAll('.career-filter__list li').forEach(function (li) {
                li.hidden = q && li.textContent.toLowerCase().indexOf(q) === -1;
            });
        }

        filters.forEach(function (filter) {
            var toggle = filter.querySelector('[data-filter-toggle]');
            var all = filter.querySelector('[data-filter-all]');
            var listSearch = filter.querySelector('[data-filter-search]');

            toggle.addEventListener('click', function () {
                var willOpen = !filter.classList.contains('is-open');
                if (!mobileQuery.matches) closeAll(filter);
                setOpen(filter, willOpen);
                if (!willOpen && !mobileQuery.matches) restore(filter);
            });

            if (all) {
                all.addEventListener('change', function () {
                    if (all.checked) boxes(filter).forEach(function (b) { b.checked = false; });
                    else syncAll(filter);
                });
            }
            boxes(filter).forEach(function (b) {
                b.addEventListener('change', function () { syncAll(filter); });
            });

            if (listSearch) {
                listSearch.addEventListener('input', function () { filterList(filter, listSearch.value); });
            }
        });

        root.querySelectorAll('[data-filters-apply]').forEach(function (btn) {
            btn.addEventListener('click', apply);
        });
        root.querySelectorAll('[data-filters-reset]').forEach(function (btn) {
            btn.addEventListener('click', reset);
        });

        var openBtn = root.querySelector('[data-filters-open]');
        var closeBtn = root.querySelector('[data-filters-close]');
        if (openBtn) openBtn.addEventListener('click', function () { openPanel(true); });
        if (closeBtn) closeBtn.addEventListener('click', function () { openPanel(false); });

        /* клік поза випадним списком закриває його (десктоп) */
        document.addEventListener('click', function (e) {
            if (mobileQuery.matches) return;
            if (!e.target.closest('[data-filter]')) closeAll();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key !== 'Escape') return;
            if (mobileQuery.matches && panel && panel.classList.contains('is-open')) openPanel(false);
            else closeAll();
        });

        /* при переході між мобільною та десктопною версіями скидаємо відкриті стани */
        var onChange = function () {
            if (panel && panel.classList.contains('is-open')) openPanel(false);
            closeAll();
        };
        if (mobileQuery.addEventListener) mobileQuery.addEventListener('change', onChange);
        else if (mobileQuery.addListener) mobileQuery.addListener(onChange);

        if (search) search.addEventListener('input', render);
    })();

    /* ---------- Форма відгуку ---------- */
    var MAX_SIZE = 5 * 1024 * 1024;
    var EXT = /\.(pdf|docx?)$/i;
    var HINT = 'Підтримувані формати: pdf | doc | docx. Максимальний розмір файлу: 5 MB.';

    function validField(input) {
        var v = input.value.trim();
        if (!v) return false;
        if (input.type === 'tel') return /^[+\d\s()-]+$/.test(v) && v.replace(/\D/g, '').length >= 9;
        if (input.type === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        return true;
    }

    document.querySelectorAll('[data-apply-form]').forEach(function (form) {
        var inputs = Array.prototype.slice.call(form.querySelectorAll('.apply-form__input'));
        var consent = form.querySelector('[data-consent]');
        var submit = form.querySelector('[data-apply-submit]');
        var status = form.querySelector('[data-form-status]');

        var upload = form.querySelector('[data-upload]');
        var zone = form.querySelector('[data-upload-zone]');
        var fileInput = form.querySelector('[data-upload-input]');
        var fileName = form.querySelector('[data-upload-name]');
        var hint = form.querySelector('[data-upload-hint]');
        var file = null;

        function update() {
            var filled = inputs.every(function (i) { return i.value.trim().length > 0; });
            submit.disabled = !(filled && consent.checked);
        }

        function setFile(f) {
            upload.classList.remove('is-invalid');
            hint.textContent = HINT;

            if (f && (!EXT.test(f.name) || f.size > MAX_SIZE)) {
                upload.classList.add('is-invalid');
                hint.textContent = !EXT.test(f.name)
                    ? 'Непідтримуваний формат файлу. Оберіть pdf, doc або docx.'
                    : 'Файл завеликий. Максимальний розмір — 5 MB.';
                f = null;
            }

            file = f || null;
            upload.classList.toggle('has-file', !!file);
            fileName.textContent = file ? file.name : '';
            if (!file) fileInput.value = '';
        }

        fileInput.addEventListener('change', function () {
            setFile(fileInput.files && fileInput.files[0]);
        });
        form.querySelector('[data-upload-remove]').addEventListener('click', function () { setFile(null); });

        ['dragenter', 'dragover'].forEach(function (type) {
            zone.addEventListener(type, function (e) {
                e.preventDefault();
                zone.classList.add('is-dragover');
            });
        });
        ['dragleave', 'drop'].forEach(function (type) {
            zone.addEventListener(type, function (e) {
                e.preventDefault();
                zone.classList.remove('is-dragover');
            });
        });
        zone.addEventListener('drop', function (e) {
            var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
            if (!f) return;
            try {
                var dt = new DataTransfer();
                dt.items.add(f);
                fileInput.files = dt.files;
            } catch (err) { /* старі браузери — файл лишається лише в змінній */ }
            setFile(f);
        });

        inputs.forEach(function (input) {
            input.addEventListener('input', function () {
                input.closest('.apply-form__field').classList.remove('is-invalid');
                if (status) status.classList.remove('is-visible');
                update();
            });
        });
        consent.addEventListener('change', update);

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var firstInvalid = null;

            inputs.forEach(function (input) {
                var ok = validField(input);
                input.closest('.apply-form__field').classList.toggle('is-invalid', !ok);
                if (!ok && !firstInvalid) firstInvalid = input;
            });

            if (firstInvalid) { firstInvalid.focus(); return; }
            if (!consent.checked) return;

            form.reset();
            setFile(null);
            update();
            if (status) {
                status.textContent = 'Дякуємо! Ваше резюме надіслано, ми зв’яжемося з вами найближчим часом.';
                status.classList.add('is-visible');
            }
        });

        update();
    });

    /* ---------- Модальне вікно ---------- */
    document.querySelectorAll('[data-modal-open]').forEach(function (btn) {
        var modal = document.getElementById(btn.getAttribute('data-modal-open'));
        if (!modal) return;
        var lastFocus = null;

        function close() {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
            lockScroll(false);
            if (lastFocus) lastFocus.focus();
        }

        btn.addEventListener('click', function () {
            lastFocus = btn;
            modal.classList.add('is-open');
            modal.setAttribute('aria-hidden', 'false');
            lockScroll(true);
            var first = modal.querySelector('input:not([type="hidden"]):not(.upload__input)');
            if (first) first.focus();
        });

        modal.addEventListener('click', function (e) {
            if (e.target === modal || e.target.closest('[data-modal-close]')) close();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
        });
    });
})();
