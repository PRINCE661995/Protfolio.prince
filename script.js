/* Living hero photo: gusts of wind move the grass */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var noise = document.getElementById('windNoise'), map = document.getElementById('windMap');
  var photo = document.querySelector('.hero-photo'), live = photo && photo.querySelector('.live');
  if (!noise || !map) return;
  var visible = true;
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(photo);
  var start = performance.now(), last = 0;
  function tick(now) {
    requestAnimationFrame(tick);
    if (!visible || now - last < 33) return;
    last = now;
    var t = (now - start) / 1000;
    var gust = 0.55 + 0.45 * Math.sin(t * 0.7) * Math.sin(t * 0.23 + 1.3);
    var fx = 0.006 + 0.0012 * Math.sin(t * 0.9), fy = 0.03 + 0.006 * Math.sin(t * 1.3 + 0.6);
    noise.setAttribute('baseFrequency', fx.toFixed(5) + ' ' + fy.toFixed(5));
    map.setAttribute('scale', (7 + 11 * gust).toFixed(2));
  }
  requestAnimationFrame(tick);
  /* Mouse parallax on desktop */
  if (live && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var tx = 0, ty = 0, cx = 0, cy = 0;
    window.addEventListener('mousemove', function (e) { tx = (e.clientX / innerWidth - .5) * -24; ty = (e.clientY / innerHeight - .5) * -16; });
    var inner = live.querySelector('.breathe');
    (function loop() { cx += (tx - cx) * .06; cy += (ty - cy) * .06; inner.style.translate = cx.toFixed(2) + 'px ' + cy.toFixed(2) + 'px'; requestAnimationFrame(loop); })();
  }
})();
/* Resume download: inside the Claude viewer use its download capability; on a normal website the plain link works */
(function () {
  var links = document.querySelectorAll('a[href="Prince_Sanjay_Mani_Resume.pdf"]');
  if (!window.claude || !window.claude.use) return;
  window.claude.use('downloads').then(function (dl) {
    if (!dl) return;
    links.forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        fetch('Prince_Sanjay_Mani_Resume.pdf').then(function (r) { return r.arrayBuffer(); }).then(function (buf) {
          return dl.save({ filename: 'Prince_Sanjay_Mani_Resume.pdf', data: new Blob([buf], { type: 'application/pdf' }) });
        }).catch(function (err) { console.warn('Download cancelled or failed', err); });
      });
    });
  }).catch(function () {});
})();
(function () {
  document.getElementById('totop').addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  var b = document.getElementById('menuBtn');
  function set(open) { document.body.classList.toggle('menu-open', open); b.setAttribute('aria-expanded', open); b.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); }
  b.addEventListener('click', function () { set(!document.body.classList.contains('menu-open')); });
  document.querySelectorAll('#mmenu a').forEach(function (a) { a.addEventListener('click', function () { set(false); }); });
  window.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
})();
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var loader = document.getElementById('loader');
  var failsafe = setTimeout(function () { loader.style.display = 'none'; }, 4000);
  if (!window.gsap || !window.ScrollTrigger || reduced) { clearTimeout(failsafe); loader.remove(); initQuotes(false); return; }
  try { main(); } catch (err) { loader.style.display = 'none'; document.querySelectorAll('[style*="transform"]').forEach(function (e) { if (e.id !== 'progress') e.style.transform = ''; }); console.error(err); }
  function main() {
  gsap.registerPlugin(ScrollTrigger);
  if (window.MotionPathPlugin) gsap.registerPlugin(MotionPathPlugin);
  document.documentElement.classList.add('js-anim');

  /* Split helper: wrap each character in a span, keep words together */
  document.querySelectorAll('.split').forEach(function (el) {
    var words = el.textContent.split(' ');
    el.innerHTML = words.map(function (w) {
      return '<span style="display:inline-block;white-space:nowrap">' + w.split('').map(function (c) { return '<span class="ch">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  /* Smooth scroll */


  /* Preloader → hero intro */
  var n = { v: 0 }, lnum = document.getElementById('lnum');
  var intro = gsap.timeline();
  intro.to(n, { v: 100, duration: 1.3, ease: 'power2.inOut', onUpdate: function () { lnum.textContent = Math.round(n.v); } })
    .to(loader, { yPercent: -100, duration: .9, ease: 'expo.inOut' })
    .set(loader, { display: 'none' }).call(function () { clearTimeout(failsafe); })
    .from('.hero-photo .live', { scale: 1.25, autoAlpha: 0, duration: 1.8, ease: 'expo.out' }, '-=.55')
    .from('.hero .ch', { yPercent: 115, rotate: 8, duration: 1.1, ease: 'expo.out', stagger: .025 }, '-=1.5')
    .from('.chip', { scale: 0, rotate: -40, duration: .9, ease: 'back.out(2)', stagger: .08 }, '-=.9')
    .from('.hero-foot .rule', { scaleX: 0, duration: 1.2, ease: 'expo.inOut' }, '-=.9')
    .from('.hero .fade', { y: 30, opacity: 0, duration: .9, ease: 'power3.out', stagger: .1 }, '-=.9')
    .from('#nav', { yPercent: -120, duration: .9, ease: 'expo.out' }, '-=1')
    .from('#tracePath', { strokeDashoffset: 2000, strokeDasharray: '2000 2000', duration: 2, ease: 'power2.inOut' }, '-=1.4')
    .to('#plane', window.MotionPathPlugin ? { duration: 2, ease: 'power2.inOut', motionPath: { path: '#tracePath', align: '#tracePath', autoRotate: true, alignOrigin: [0.5, 0.5] } } : { opacity: 0, duration: .1 }, '<')
    .set('#tracePath', { strokeDasharray: '6 8' });

  /* Chips float on scroll; hero drifts */
  gsap.to('.chip', { y: function (i) { return (i % 2 ? -1 : 1) * 40; }, rotate: function (i) { return (i % 2 ? -1 : 1) * 12; }, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero-photo .live', { yPercent: -8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero h1', { yPercent: -18, opacity: .3, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* Scroll progress + hide nav on scroll down */
  gsap.to('#progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .3 } });
  var nav = document.getElementById('nav');
  ScrollTrigger.create({ start: 120, end: 'max', onToggle: function (s) { nav.classList.toggle('scrolled', s.isActive); }, onUpdate: function (s) { nav.classList.toggle('hide', s.direction === 1 && !document.body.classList.contains('menu-open')); } });

  /* Marquee with scroll-velocity boost and direction flip */
  var track = document.getElementById('mtrack'), grp = track.querySelector('.grp');
  for (var k = 0; k < 3; k++) track.appendChild(grp.cloneNode(true));
  var x = 0, dir = -1, boost = 0;
  gsap.ticker.add(function () {
    var w = grp.offsetWidth;
    x += (1.2 + boost) * dir;
    if (x <= -w) x += w; if (x > 0) x -= w;
    track.style.transform = 'translate3d(' + x + 'px,0,0)';
    boost *= 0.92;
  });
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: function (s) { dir = s.direction === 1 ? -1 : 1; boost = Math.min(Math.abs(s.getVelocity()) / 120, 18); } });

  /* Masked heading reveals */
  gsap.utils.toArray('section .sec-head .mask .ln').forEach(function (el) {
    gsap.from(el, { yPercent: 110, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });
  gsap.utils.toArray('section .fade').forEach(function (el) {
    gsap.from(el, { y: 30, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
  });

  /* Image inner parallax */
  gsap.utils.toArray('.art .fill').forEach(function (f) {
    gsap.fromTo(f, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: f.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  var mm = gsap.matchMedia();
  mm.add('(min-width: 901px) and (hover: hover)', function () {
    /* Photo columns move at different speeds */
    gsap.utils.toArray('.photos .art').forEach(function (p) {
      gsap.to(p, { y: function () { return parseFloat(p.dataset.speed) * 600; }, ease: 'none', scrollTrigger: { trigger: '.photos', start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  });
  

  /* Project cards: rise in with a clip reveal */
  gsap.utils.toArray('.work').forEach(function (w, i) {
    gsap.from(w, { y: 90, opacity: 0, duration: 1.1, ease: 'expo.out', delay: (i % 2) * .12, scrollTrigger: { trigger: w, start: 'top 92%' } });
    var art = w.querySelector('.art');
    if (art) gsap.from(art, { clipPath: 'inset(18% 10% 18% 10% round 40px)', duration: 1.4, ease: 'expo.out', delay: (i % 2) * .12, clearProps: 'clipPath', scrollTrigger: { trigger: w, start: 'top 92%' } });
  });

  /* Dark mode for services section */
  ScrollTrigger.create({ trigger: '#services', start: 'top 80%', end: 'bottom 20%', toggleClass: { targets: document.body, className: 'is-dark' } });
  gsap.from('#svc li', { y: 60, opacity: 0, duration: 1, ease: 'expo.out', stagger: .1, scrollTrigger: { trigger: '#svc', start: 'top 80%' } });

  /* Service hover preview follows cursor */
  var preview = document.getElementById('preview');
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var px = gsap.quickTo(preview, 'x', { duration: .6, ease: 'power3' }), py = gsap.quickTo(preview, 'y', { duration: .6, ease: 'power3' });
    var hidePreview = function () { gsap.to(preview, { scale: 0, autoAlpha: 0, duration: .3, ease: 'power3.in' }); };
    document.querySelectorAll('#svc li').forEach(function (li) {
      li.addEventListener('mouseenter', function (e) {
        preview.className = 'art ' + li.dataset.art;
        gsap.set(preview, { x: e.clientX + 160, y: e.clientY });
        gsap.to(preview, { scale: 1, autoAlpha: 1, rotate: gsap.utils.random(-8, 8), duration: .5, ease: 'back.out(1.6)' });
      });
      li.addEventListener('mouseleave', hidePreview);
      li.addEventListener('mousemove', function (e) { px(e.clientX + 160); py(e.clientY); });
    });
    window.addEventListener('scroll', hidePreview, { passive: true });
  } else { preview.remove(); }

  /* Scroll-scrubbed word highlight */
  var rt = document.getElementById('revealText');
  if (rt) {
  var html = rt.innerHTML.replace('<em>simple.</em>', '§');
  rt.innerHTML = html.split(' ').map(function (w) { return w === '§' ? '<span class="w"><em>simple.</em></span>' : '<span class="w">' + w + '</span>'; }).join(' ');
  gsap.to('#revealText .w', { color: 'var(--ink)', stagger: .1, ease: 'none', scrollTrigger: { trigger: rt, start: 'top 80%', end: 'bottom 45%', scrub: true } });
  }

  /* Resume timeline */
  gsap.to('#rail', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '#timeline', start: 'top 70%', end: 'bottom 60%', scrub: true } });
  gsap.utils.toArray('.job').forEach(function (j) {
    gsap.from(j, { x: 60, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: j, start: 'top 85%' } });
  });
  gsap.utils.toArray('.side .block').forEach(function (b) {
    gsap.from(b.querySelectorAll('h4, .edu, .pill, .btn, .resume-note'), { y: 24, opacity: 0, duration: .8, ease: 'power3.out', stagger: .04, scrollTrigger: { trigger: b, start: 'top 88%' } });
  });

  /* Counters */
  gsap.utils.toArray('.cnt').forEach(function (c) {
    var o = { v: 0 }, to = +c.dataset.to;
    gsap.to(o, { v: to, duration: 2, ease: 'power3.out', scrollTrigger: { trigger: c, start: 'top 90%' }, onUpdate: function () { c.textContent = Math.round(o.v); } });
  });

  /* Footer CTA */
  gsap.from('footer .big-cta .ch', { yPercent: 115, duration: 1, ease: 'expo.out', stagger: .018, scrollTrigger: { trigger: 'footer', start: 'top 70%' } });
  gsap.from('footer .arrow', { x: -80, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: 'footer', start: 'top 60%' } });

  /* Custom cursor */
  var cur = document.getElementById('cursor'), label = cur.querySelector('span');
  var cx = gsap.quickTo(cur, 'x', { duration: .25, ease: 'power3' }), cy = gsap.quickTo(cur, 'y', { duration: .25, ease: 'power3' });
  window.addEventListener('mousemove', function (e) { cur.style.opacity = 1; cx(e.clientX); cy(e.clientY); });
  document.querySelectorAll('[data-cursor]').forEach(function (el) {
    el.addEventListener('mouseenter', function () { label.textContent = el.dataset.cursor; cur.classList.add('big'); });
    el.addEventListener('mouseleave', function () { cur.classList.remove('big'); });
  });
  document.querySelectorAll('a:not([data-cursor]), button').forEach(function (el) {
    el.addEventListener('mouseenter', function () { cur.classList.add('hover'); });
    el.addEventListener('mouseleave', function () { cur.classList.remove('hover'); });
  });

  /* Magnetic buttons */
  document.querySelectorAll('.magnetic').forEach(function (el) {
    var mx = gsap.quickTo(el, 'x', { duration: .5, ease: 'elastic.out(1,.4)' }), my = gsap.quickTo(el, 'y', { duration: .5, ease: 'elastic.out(1,.4)' });
    el.addEventListener('mousemove', function (e) { var r = el.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * .35); my((e.clientY - r.top - r.height / 2) * .35); });
    el.addEventListener('mouseleave', function () { mx(0); my(0); });
  });

  initQuotes(true);
  }

  function initQuotes(anim) {
    var slides = document.querySelectorAll('.slide'), i = 0, count = document.getElementById('count'), bar = document.getElementById('qbar'), timer;
    function pad(v) { return (v < 10 ? '0' : '') + v; }
    function show(next) {
      next = (next + slides.length) % slides.length;
      var cur = slides[i], nxt = slides[next];
      if (anim && cur !== nxt) {
        gsap.to(cur, { yPercent: -20, opacity: 0, duration: .5, ease: 'power3.in', onComplete: function () { cur.classList.remove('on'); gsap.set(cur, { yPercent: 0, opacity: 1 }); } });
        nxt.classList.add('on');
        gsap.fromTo(nxt.querySelectorAll('blockquote, .who'), { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: .9, delay: .35, ease: 'expo.out', stagger: .08 });
      } else { slides.forEach(function (s, k) { s.classList.toggle('on', k === next); }); }
      i = next; count.textContent = pad(i + 1) + ' / ' + pad(slides.length);
      if (anim) { gsap.killTweensOf(bar); gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 6, ease: 'none', onComplete: function () { show(i + 1); } }); }
    }
    document.getElementById('prev').addEventListener('click', function () { show(i - 1); });
    document.getElementById('next').addEventListener('click', function () { show(i + 1); });
    if (anim) gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 6, ease: 'none', onComplete: function () { show(i + 1); } });
  }

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
