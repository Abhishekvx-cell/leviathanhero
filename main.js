/* ==========================================================================
   LEVIATHAN — site behaviour
   ========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. The gate ──────────────────────────────────────────────────────── */
  var gate = document.getElementById('gate');
  var gateBtn = document.getElementById('gateBtn');

  function openSite() {
    if (!document.body.classList.contains('is-gated')) return;
    gate.classList.add('is-open');
    document.body.classList.remove('is-gated');
    window.scrollTo(0, 0);
    setTimeout(function () { gate.remove(); }, 1200);
    document.dispatchEvent(new CustomEvent('leviathan:entered'));
  }

  gateBtn.addEventListener('click', openSite);
  gate.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') openSite();
  });
  gateBtn.focus({ preventScroll: true });

  /* ── 2. Sticky nav ────────────────────────────────────────────────────── */
  var nav = document.getElementById('nav');
  var onScrollNav = function () {
    nav.classList.toggle('is-stuck', window.scrollY > 40);
  };
  onScrollNav();

  /* ── 3. Depth rail ────────────────────────────────────────────────────── */
  var fill = document.getElementById('depthFill');
  var num = document.getElementById('depthNum');
  var MAX_DEPTH = 361; // metres — where the Aqua Core was found

  function onScrollDepth() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    fill.style.height = (p * 100) + '%';
    num.textContent = Math.round(p * MAX_DEPTH);
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      onScrollNav();
      onScrollDepth();
      ticking = false;
    });
  }, { passive: true });
  onScrollDepth();

  /* ── 4. Scroll reveals ────────────────────────────────────────────────── */
  var items = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var group = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
        el.style.transitionDelay = Math.min(group, 4) * 90 + 'ms';
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ── 5. Smooth anchor scrolling that respects the fixed nav ───────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* ── 6. Rising bubbles ────────────────────────────────────────────────── */
  var canvas = document.getElementById('bubbles');
  if (canvas && !reduce) {
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var bubbles = [];
    var w = 0, h = 0;

    function size() {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      var count = Math.round(Math.min(70, Math.max(26, w / 22)));
      bubbles = [];
      for (var i = 0; i < count; i++) {
        bubbles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 0.8 + Math.random() * 3.2,
          v: 0.15 + Math.random() * 0.55,
          drift: (Math.random() - 0.5) * 0.35,
          phase: Math.random() * Math.PI * 2,
          a: 0.12 + Math.random() * 0.4
        });
      }
    }

    function frame(t) {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < bubbles.length; i++) {
        var b = bubbles[i];
        b.y -= b.v;
        b.x += Math.sin(t / 1600 + b.phase) * 0.28 + b.drift * 0.1;
        if (b.y < -10) { b.y = h + 10; b.x = Math.random() * w; }
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(180,235,240,' + b.a * 0.45 + ')';
        ctx.fill();
        ctx.lineWidth = 0.7;
        ctx.strokeStyle = 'rgba(220,250,255,' + b.a + ')';
        ctx.stroke();
      }
      requestAnimationFrame(frame);
    }

    size(); seed(); requestAnimationFrame(frame);
    window.addEventListener('resize', function () { size(); seed(); });
  }

  /* ── 7. The wave ring around the portrait ─────────────────────────────── */
  function wavePath(radius, amp, lobes, phase) {
    var cx = 220, cy = 220, steps = 300, d = '';
    for (var i = 0; i <= steps; i++) {
      var t = (Math.PI * 2 * i) / steps;
      var r = radius + amp * Math.sin(lobes * t + phase);
      var x = (cx + r * Math.cos(t)).toFixed(1);
      var y = (cy + r * Math.sin(t)).toFixed(1);
      d += (i ? 'L' : 'M') + x + ' ' + y;
    }
    return d + 'Z';
  }

  var waveA = document.getElementById('ringWaveA');
  var waveB = document.getElementById('ringWaveB');
  if (waveA && waveB) {
    waveA.setAttribute('d', wavePath(198, 7.5, 24, 0));
    waveB.setAttribute('d', wavePath(212, 5, 18, Math.PI / 2));
  }

  /* ── 8. Parallax drift on the portrait ────────────────────────────────── */
  var portrait = document.getElementById('portrait');
  if (portrait && !reduce && window.matchMedia('(pointer:fine)').matches) {
    window.addEventListener('mousemove', function (e) {
      var dx = (e.clientX / window.innerWidth - 0.5) * 16;
      var dy = (e.clientY / window.innerHeight - 0.5) * 12;
      portrait.style.setProperty('--px', dx.toFixed(2) + 'px');
      portrait.style.setProperty('--py', dy.toFixed(2) + 'px');
      portrait.style.marginLeft = dx.toFixed(2) + 'px';
      portrait.style.marginTop = dy.toFixed(2) + 'px';
    }, { passive: true });
  }
})();
