/* ==========================================================================
   Shared site scripts
   ========================================================================== */

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
