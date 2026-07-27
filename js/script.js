setMainPadding()
let resizeTimeout;
function setMainPadding() {
  const header = document.querySelector('header');
  const main = document.querySelector('main.main');

  if (!header || !main) return;

  main.style.paddingTop = header.offsetHeight + 'px';
}
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(setMainPadding, 100);
});

let swiper = new Swiper(".hero__slider", {
    loop: true,
    spaceBetween: 0,
    slidesPerView: 1,
    allowTouchMove: true,
    navigation: {
        nextEl: ".hero__slider-next",
        prevEl: ".hero__slider-prev",
    },
    pagination: {
        el: ".hero__slider-pagination",
        clickable: true,
    },
    // breakpoints: {
    //     775: {
    //         spaceBetween: 30,
    //         slidesPerView: 3,
    //     },
    //     931: {
    //         spaceBetween: 30,
    //         slidesPerView: 4,
    //     },
    // },
});

let prodsliderSlider = new Swiper(".prodslider__slider", {
    loop: true,
    spaceBetween: 8,
    slidesPerView: 2,
    allowTouchMove: true,
    pagination: {
        el: ".prodslider__slider-pagination",
        clickable: true,
    },
    breakpoints: {
        769: {
            slidesPerView: 3,
        },
        1025: {
            slidesPerView: 4,
        },
    },
});

let joinusSlider = new Swiper(".joinus__slider", {
    loop: true,
    spaceBetween: 8,
    slidesPerView: 1.2,
    allowTouchMove: true,
    breakpoints: {
        769: {
            slidesPerView: 3,
        },
        1025: {
            slidesPerView: 4,
        },
    },
});


// Поиск в шапке — открытие/закрытие
const searchOpen = document.querySelector('.header__search-open');
const headerSearch = document.querySelector('.header__search');

if (searchOpen && headerSearch) {
  searchOpen.addEventListener('click', (e) => {
    e.stopPropagation();
    headerSearch.classList.toggle('show');
  });

  document.addEventListener('click', (e) => {
    if (!headerSearch.contains(e.target)) {
      headerSearch.classList.remove('show');
    }
  });
}

// Перенос footer__info между колонками в зависимости от ширины экрана
const footerInfo = document.querySelector('.footer__info');
const footerLeft = document.querySelector('.footer__left');
const footerRight = document.querySelector('.footer__right');

function moveFooterInfo() {
  if (!footerInfo || !footerLeft || !footerRight) return;

  if (window.innerWidth < 769) {
    // на узких экранах переносим в правую колонку
    if (footerInfo.parentElement !== footerRight) {
      footerRight.appendChild(footerInfo);
    }
  } else {
    // на широких экранах возвращаем обратно в левую колонку
    if (footerInfo.parentElement !== footerLeft) {
      footerLeft.appendChild(footerInfo);
    }
  }
}

window.addEventListener('load', moveFooterInfo);
window.addEventListener('resize', moveFooterInfo);

// Мобильное меню: бургер + аккордеоны (каталог раскрывается прямо под кнопкой)
const header = document.querySelector('.header');
const headerBurger = document.querySelector('.header__burger');
const mobileMenu = document.querySelector('.mobile-menu');

// Сброс меню в исходное состояние (все аккордеоны закрыты)
function resetMobileMenu() {
  document.querySelectorAll('.mobile-menu__has-children.is-open')
    .forEach((item) => item.classList.remove('is-open'));
}

if (headerBurger && header) {
  headerBurger.addEventListener('click', (e) => {
    e.stopPropagation();
    const opened = header.classList.toggle('show-menu');
    document.body.classList.toggle('menu-open', opened);
    if (!opened) resetMobileMenu();
  });
}

// Аккордеоны: «Категорії товарів» и вложенные подкатегории
document.querySelectorAll('.mobile-menu__acc').forEach((btn) => {
  btn.addEventListener('click', () => {
    btn.closest('.mobile-menu__has-children').classList.toggle('is-open');
  });
});

// Закрытие меню при клике по обычной ссылке
if (mobileMenu) {
  mobileMenu.querySelectorAll('a[href]').forEach((link) => {
    link.addEventListener('click', () => {
      header.classList.remove('show-menu');
      document.body.classList.remove('menu-open');
      resetMobileMenu();
    });
  });
}

// Открытие/закрытие каталога (mega-menu) по кнопке «Каталог»
const menuOpen = document.querySelector('.header__menu-open');
const megaMenu = document.querySelector('.mega-menu');

if (menuOpen && header) {
  // клик по кнопке — переключаем класс
  menuOpen.addEventListener('click', (e) => {
    e.stopPropagation();
    header.classList.toggle('catalog-open');
  });

  // клик вне блока sub-menu (mega-menu) или повторный клик по кнопке — закрываем
  document.addEventListener('click', (e) => {
    if (megaMenu && megaMenu.contains(e.target)) return;
    if (menuOpen.contains(e.target)) return;
    header.classList.remove('catalog-open');
  });
}

// Страница входа: показать/скрыть пароль
// перечёркнутый глаз — пока пароль заполнен и скрыт, обычный — когда пуст или открыт
document.querySelectorAll('.login__eye').forEach((btn) => {
  const input = btn.closest('.login__field').querySelector('.login__input');
  if (!input) return;

  function updateEye() {
    const hidden = input.type === 'password';
    btn.classList.toggle('is-active', hidden && input.value !== '');
    btn.setAttribute('aria-label', hidden ? 'Показати пароль' : 'Сховати пароль');
  }

  btn.addEventListener('click', () => {
    input.type = input.type === 'password' ? 'text' : 'password';
    updateEye();
  });

  input.addEventListener('input', updateEye);
  updateEye();
});

// Страница входа: кнопка «Увійти» активна только с заполненными полями
const loginForm = document.querySelector('.login__form');

if (loginForm) {
  const loginSubmit = loginForm.querySelector('.login__submit');
  const loginFields = loginForm.querySelectorAll('.login__input');

  function toggleLoginSubmit() {
    const filled = [...loginFields].every((field) => field.value.trim() !== '');
    loginSubmit.disabled = !filled;
  }

  loginFields.forEach((field) => field.addEventListener('input', toggleLoginSubmit));
  toggleLoginSubmit();
}

// FAQ accordion (jQuery — для плавного раскрытия)
jQuery(function ($) {
  $('.faq__item-title').on('click', function () {
    const $item = $(this).closest('.faq__item');

    if ($item.hasClass('is-active')) {
      // закрываем активный пункт
      $item.removeClass('is-active');
      $item.find('.faq__item-descr').slideUp(300);
    } else {
      // закрываем остальные, открываем текущий
      $('.faq__item.is-active').removeClass('is-active')
        .find('.faq__item-descr').slideUp(300);
      $item.addClass('is-active');
      $item.find('.faq__item-descr').slideDown(300);
    }
  });
});