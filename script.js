/* ==========================================================================
   Shared site scripts
   ========================================================================== */

/* Sticky header offset
   Measures the header's real height (it wraps to two rows on phones) and uses it
   for scroll-padding-top so anchored sections land just below the header. */
(function () {
  var header = document.querySelector('header');
  if (!header) return;
  var root = document.documentElement;

  function updateOffset() {
    root.style.scrollPaddingTop = (header.offsetHeight + 16) + 'px';
  }

  updateOffset();
  window.addEventListener('resize', updateOffset);
  window.addEventListener('load', function () {
    updateOffset();
    // Re-align a section linked from another page now that the offset is correct
    var target = location.hash && document.getElementById(location.hash.slice(1));
    if (target) target.scrollIntoView();
  });
  if ('ResizeObserver' in window) new ResizeObserver(updateOffset).observe(header);
})();

/* Active nav link
   On the homepage, underlines the nav link for the section currently in view. */
(function () {
  var links = Array.prototype.filter.call(document.querySelectorAll('.nav-links a'), function (a) {
    var hash = a.getAttribute('href').split('#')[1];
    return hash && document.getElementById(hash);
  });
  if (!links.length) return;

  var header = document.querySelector('header');
  var sections = links.map(function (a) {
    return document.getElementById(a.getAttribute('href').split('#')[1]);
  });

  function setActive() {
    var threshold = (header ? header.offsetHeight : 0) + 40;
    var current = 0;
    sections.forEach(function (section, i) {
      if (section.getBoundingClientRect().top <= threshold) current = i;
    });
    // At the bottom of the page, the last section may be too short to reach the top
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      current = sections.length - 1;
    }
    links.forEach(function (a, i) {
      a.classList.toggle('active', i === current);
      if (i === current) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { setActive(); ticking = false; });
  }, { passive: true });
  window.addEventListener('resize', setActive);
  window.addEventListener('load', setActive);
  setActive();
})();

/* Animated counters
   Any element with data-count-to counts up when scrolled into view.
   Optional: data-count-from, data-decimals, data-prefix, data-suffix, data-duration (ms). */
(function () {
  var counters = document.querySelectorAll('[data-count-to]');
  if (!counters.length) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function format(el, value) {
    var decimals = parseInt(el.dataset.decimals || '0', 10);
    el.textContent = (el.dataset.prefix || '') + value.toFixed(decimals) + (el.dataset.suffix || '');
  }

  function animate(el) {
    var from = parseFloat(el.dataset.countFrom || '0');
    var to = parseFloat(el.dataset.countTo);
    var duration = parseInt(el.dataset.duration || '2000', 10);
    var start = null;

    function step(timestamp) {
      if (start === null) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      format(el, from + (to - from) * eased);
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  if (reduceMotion || !('IntersectionObserver' in window)) {
    counters.forEach(function (el) { format(el, parseFloat(el.dataset.countTo)); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      animate(entry.target);
    });
  }, { threshold: 0.5 });

  counters.forEach(function (el) {
    format(el, parseFloat(el.dataset.countFrom || '0'));
    observer.observe(el);
  });
})();

/* Chart.js theme shared by every chart on the site */
if (window.Chart) {
  Chart.defaults.color = '#EDEAE4';
  Chart.defaults.borderColor = 'rgba(237, 234, 228, 0.08)';
  Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  Chart.defaults.plugins.title.color = '#BFA06A';
  Chart.defaults.plugins.title.font = { family: "'Montserrat', sans-serif", size: 15, weight: '600' };
  Chart.defaults.plugins.tooltip.backgroundColor = '#0E0E0E';
  Chart.defaults.plugins.tooltip.borderColor = '#BFA06A';
  Chart.defaults.plugins.tooltip.borderWidth = 1;
  Chart.defaults.maintainAspectRatio = false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    Chart.defaults.animation = false;
  }
}
