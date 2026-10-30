// ===== Mobile nav =====
(function () {
  var toggle = document.getElementById('nav-toggle');
  var closeBtn = document.getElementById('nav-close');
  var nav = document.getElementById('mobile-nav');
  var backdrop = document.getElementById('nav-backdrop');

  function openNav() {
    nav.classList.add('is-open');
    backdrop.classList.add('is-open');
    nav.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    nav.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    nav.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (toggle) toggle.addEventListener('click', openNav);
  if (closeBtn) closeBtn.addEventListener('click', closeNav);
  if (backdrop) backdrop.addEventListener('click', closeNav);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
  });
})();

// ===== Hero occasion rotator =====
(function () {
  document.querySelectorAll('[data-hero-rotator]').forEach(function (hero) {
    var count = hero.querySelectorAll('.hero__occasion-item').length;
    if (count < 2) return;

    var interval = parseInt(hero.dataset.interval, 10) || 2500;
    var current = 0;
    var timer = null;

    function show(index) {
      if (index === current) return;
      hero.querySelectorAll('[data-hero-slide]').forEach(function (el) {
        var i = parseInt(el.dataset.heroSlide, 10);
        el.classList.toggle('is-leaving', i === current);
        el.classList.toggle('is-active', i === index);
        el.setAttribute('aria-hidden', i === index ? 'false' : 'true');
      });
      current = index;
    }

    function start() {
      stop();
      timer = setInterval(function () { show((current + 1) % count); }, interval);
    }

    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    // Pause while the visitor is reading or interacting with the hero
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    hero.addEventListener('focusin', stop);
    hero.addEventListener('focusout', start);
    document.addEventListener('visibilitychange', function () {
      document.hidden ? stop() : start();
    });

    // Theme editor: jump to and hold the selected occasion block
    document.addEventListener('shopify:block:select', function (e) {
      if (!hero.contains(e.target)) return;
      var slide = e.target.closest('[data-hero-slide]');
      if (slide) { stop(); show(parseInt(slide.dataset.heroSlide, 10)); }
    });
    document.addEventListener('shopify:block:deselect', function (e) {
      if (hero.contains(e.target)) start();
    });

    start();
  });
})();

// ===== Sticky buy bar =====
(function () {
  var bar = document.getElementById('sticky-buy-bar');
  var atcBtn = document.querySelector('.btn-add-to-cart:not(.sticky-buy-bar__btn)');
  var stickyBtn = document.getElementById('sticky-atc-btn');

  if (!bar || !atcBtn) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) {
        bar.classList.add('is-visible');
        bar.setAttribute('aria-hidden', 'false');
      } else {
        bar.classList.remove('is-visible');
        bar.setAttribute('aria-hidden', 'true');
      }
    });
  }, { threshold: 0 });

  observer.observe(atcBtn);

  // Clicking sticky btn submits the main product form
  if (stickyBtn) {
    stickyBtn.addEventListener('click', function () {
      var form = document.querySelector('form[action="/cart/add"]');
      if (form) form.submit();
    });
  }
})();

// ===== Product page =====
(function () {
  // Thumbnail image switcher
  document.querySelectorAll('.product-thumb').forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      document.querySelectorAll('.product-thumb').forEach(function (t) {
        t.classList.remove('is-active');
      });
      this.classList.add('is-active');
      var mainImg = document.getElementById('product-main-img');
      if (mainImg && this.dataset.src) mainImg.src = this.dataset.src;
    });
  });

  // Quantity selector
  var qtyInput = document.querySelector('.qty-input');
  var qtyMinus = document.querySelector('.qty-minus');
  var qtyPlus = document.querySelector('.qty-plus');

  if (qtyMinus) qtyMinus.addEventListener('click', function () {
    if (qtyInput && parseInt(qtyInput.value) > 1) {
      qtyInput.value = parseInt(qtyInput.value) - 1;
    }
  });

  if (qtyPlus) qtyPlus.addEventListener('click', function () {
    if (qtyInput) qtyInput.value = parseInt(qtyInput.value) + 1;
  });

  // Color swatches + option buttons
  document.querySelectorAll('.color-swatch, .option-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var option = this.dataset.option;
      document.querySelectorAll('[data-option="' + option + '"]').forEach(function (b) {
        b.classList.remove('is-active');
      });
      this.classList.add('is-active');
    });
  });
})();

// ===== Collection grid toggle =====
(function () {
  document.querySelectorAll('.grid-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.grid-btn').forEach(function (b) { b.classList.remove('is-active'); });
      this.classList.add('is-active');
      var grid = document.getElementById('product-grid');
      if (!grid) return;
      if (this.dataset.grid === 'dense') {
        grid.style.gridTemplateColumns = 'repeat(5, 1fr)';
        grid.style.gap = '0.5rem';
      } else {
        grid.style.gridTemplateColumns = '';
        grid.style.gap = '';
      }
    });
  });
})();

// ===== Cart quantity update =====
document.querySelectorAll('.cart-quantity').forEach(function (input) {
  input.addEventListener('change', function () {
    this.closest('form').submit();
  });
});

// ===== Collection filter dropdowns =====
(function () {
  var dropdowns = document.querySelectorAll('.filter-dropdown');
  if (!dropdowns.length) return;

  function closeAll() {
    dropdowns.forEach(function (d) {
      var pill = d.querySelector('.filter-pill');
      var panel = d.querySelector('.filter-panel');
      if (pill) pill.setAttribute('aria-expanded', 'false');
      if (panel) panel.hidden = true;
    });
  }

  dropdowns.forEach(function (dropdown) {
    var pill = dropdown.querySelector('.filter-pill');
    var panel = dropdown.querySelector('.filter-panel');
    if (!pill || !panel) return;

    pill.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = pill.getAttribute('aria-expanded') === 'true';
      closeAll();
      if (!isOpen) {
        pill.setAttribute('aria-expanded', 'true');
        panel.hidden = false;
      }
    });
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.filter-dropdown')) closeAll();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll();
  });
})();
