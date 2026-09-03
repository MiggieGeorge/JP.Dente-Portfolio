/* Scroll reveal, active nav, matrix rain and the UI animation layer */
(function () {
  var root = document.documentElement;

  // Marks that JS is alive. CSS only hides scroll-reveal content when this is set,
  // so a JS failure degrades to "everything visible" instead of a blank page.
  root.classList.add('js');

  document.addEventListener('DOMContentLoaded', function () {
    // --- active nav link ---
    var here = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (href.indexOf('#') !== -1) return;           // in-page jump links are never "active"
      if (href.split('/').pop() === here) a.classList.add('active');
    });

    // On the home page, highlight the section you're currently scrolled to.
    if (here === 'index.html' || here === '') {
      var secs = [].slice.call(document.querySelectorAll('section[id]'));
      var map = {};
      document.querySelectorAll('.nav-links a[href*="#"]').forEach(function (a) {
        map[a.getAttribute('href').split('#')[1]] = a;
      });
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          var link = map[e.target.id];
          if (link) link.classList.toggle('active', e.isIntersecting);
        });
      }, { rootMargin: '-45% 0px -45% 0px' });
      secs.forEach(function (s) { spy.observe(s); });
    }

    // --- scroll reveal ---
    var items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    // threshold is intentionally tiny (not a "12% of the element visible" gate):
    // for a short stat card that's basically instant either way, but for a tall
    // multi-project section it's the difference between revealing as soon as
    // you scroll to it versus waiting until 12% of a several-thousand-pixel
    // block has scrolled past — which could mean never, on a short section
    // wrapping a very long one.
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.01, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });

    var calmMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- stat numbers count up when they scroll into view ---
    var nums = document.querySelectorAll('.stat .num');
    if (nums.length && !calmMotion) {
      // Blank them here rather than in the observer callback, so the real value
      // never flashes on screen before the count starts.
      nums.forEach(function (n) {
        var raw = n.textContent.trim();
        if (!parseInt(raw.replace(/\D/g, ''), 10)) return;
        n.dataset.final = raw;
        n.textContent = '0' + raw.replace(/[\d]/g, '');
      });

      var countIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          countIO.unobserve(e.target);
          var el = e.target;
          var raw = el.dataset.final;
          if (!raw) return;
          var target = parseInt(raw.replace(/\D/g, ''), 10);
          var suffix = raw.replace(/[\d]/g, '');   // keeps things like a trailing "+"
          var dur = 1100, t0 = null;

          // A small target only has a handful of integer steps. With a hard ease-out
          // it hits its final value a third of the way in and then sits there while
          // the four-digit tiles are still spinning, which reads as broken. Small
          // numbers therefore ramp linearly so every tile lands together.
          var gentle = target <= 20;

          function step(ts) {
            if (t0 === null) t0 = ts;
            var p = Math.min((ts - t0) / dur, 1);
            var eased = gentle ? p : 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = raw;             // land exactly on the original string
          }
          requestAnimationFrame(step);
        });
      }, { threshold: 0.6 });
      nums.forEach(function (n) { countIO.observe(n); });

      // Safety net: if a tile somehow never crosses the threshold (odd viewport,
      // observer never fires), restore the real number rather than leaving a 0.
      setTimeout(function () {
        nums.forEach(function (n) {
          if (n.dataset.final && n.textContent.trim() === '0' + n.dataset.final.replace(/[\d]/g, '')) {
            n.textContent = n.dataset.final;
          }
        });
      }, 4000);
    }

    // --- skill tags flip in one by one ---
    var tagLists = document.querySelectorAll('.tags');
    if (!calmMotion) {
      var tagIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          tagIO.unobserve(e.target);
          e.target.classList.add('stagger');
          [].forEach.call(e.target.children, function (li, i) {
            li.style.animationDelay = (i * 45) + 'ms';
          });
        });
      }, { threshold: 0.2 });
      tagLists.forEach(function (l) { tagIO.observe(l); });
    }

    // --- portrait tilt + sheen (pointer devices only) ---
    var card = document.querySelector('.portrait');
    var wrap = document.querySelector('.portrait-wrap');
    var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (card && wrap && fine && !calm) {
      var MAX = 9;          // degrees of tilt at the far edge. higher reads as gimmicky.
      var frame = null;

      wrap.addEventListener('mousemove', function (e) {
        if (frame) return;                        // throttle to one update per frame
        frame = requestAnimationFrame(function () {
          frame = null;
          var r = card.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width;
          var py = (e.clientY - r.top) / r.height;
          var rotY = (px - 0.5) * 2 * MAX;
          var rotX = (0.5 - py) * 2 * MAX;
          card.style.transition = 'filter 0.3s ease, box-shadow 0.35s ease';
          card.style.transform =
            'rotateX(' + rotX.toFixed(2) + 'deg) rotateY(' + rotY.toFixed(2) + 'deg) scale(1.03)';
          // shadow leans away from the cursor, as if the light were where the mouse is
          card.style.setProperty('--gx', ((0.5 - px) * 26).toFixed(1) + 'px');
          card.style.setProperty('--gy', ((0.5 - py) * 18).toFixed(1) + 'px');
        });
      });

      wrap.addEventListener('mouseenter', function () { card.classList.add('tilting'); });

      wrap.addEventListener('mouseleave', function () {
        if (frame) { cancelAnimationFrame(frame); frame = null; }
        card.classList.remove('tilting');
        card.style.transition = '';               // back to the slow ease from the stylesheet
        card.style.transform = '';
        card.style.removeProperty('--gx');
        card.style.removeProperty('--gy');
      });
    }

    // ===================== UI ANIMATION LAYER =====================
    if (!calmMotion) {

      // --- scroll progress bar + nav compact + back-to-top ---
      var bar = document.createElement('div');
      bar.className = 'progress';
      document.body.appendChild(bar);

      var top = document.createElement('button');
      top.className = 'to-top';
      top.setAttribute('aria-label', 'Back to top');
      top.textContent = '↑';
      top.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      document.body.appendChild(top);

      var nav = document.querySelector('.nav');
      var ticking = false;
      function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          ticking = false;
          var max = document.documentElement.scrollHeight - window.innerHeight;
          var y = window.scrollY;
          bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
          if (nav) nav.classList.toggle('compact', y > 40);
          top.classList.toggle('show', y > 600);
        });
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();

      // --- cursor spotlight across cards ---
      var lit = document.querySelectorAll('.card, .project');
      lit.forEach(function (el) {
        var f = null;
        el.addEventListener('mousemove', function (e) {
          if (f) return;
          f = requestAnimationFrame(function () {
            f = null;
            var r = el.getBoundingClientRect();
            el.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 100).toFixed(1) + '%');
            el.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 100).toFixed(1) + '%');
          });
        });
        el.addEventListener('mouseenter', function () { el.classList.add('lit'); });
        el.addEventListener('mouseleave', function () { el.classList.remove('lit'); });
      });

      // --- hero headline rises word by word ---
      var h1 = document.querySelector('.hero h1');
      if (h1) {
        var html = h1.innerHTML;
        // split on spaces but keep the <span class="accent"> wrapper intact
        var tmp = document.createElement('div');
        tmp.innerHTML = html;
        var out = '';
        [].forEach.call(tmp.childNodes, function (n) {
          if (n.nodeType === 3) {
            n.textContent.split(/(\s+)/).forEach(function (w) {
              out += /^\s+$/.test(w) ? w : (w ? '<span>' + w + '</span>' : '');
            });
          } else {
            out += '<span>' + n.outerHTML + '</span>';
          }
        });
        h1.innerHTML = out;
        h1.classList.add('rise');
        [].forEach.call(h1.querySelectorAll(':scope > span'), function (s, i) {
          s.style.animationDelay = (80 + i * 90) + 'ms';
        });
      }
    }


    // --- matrix rain backdrop ---
    // Real depth via WebGL when Three.js is available (columns sit at different
    // z distances, with fog dimming the far ones). Falls back to the original
    // flat 2D canvas rain if the CDN script didn't load, so the effect degrades
    // rather than disappearing.
    if (!calmMotion && typeof THREE !== 'undefined') {
      initMatrixRain3D();
    } else if (!calmMotion) {
      initMatrixRain2D();
    }

    function rainColor() {
      var c = getComputedStyle(document.documentElement).getPropertyValue('--matrix').trim();
      return c || '#00ff41';
    }

    // Draws a single character to a small canvas and returns it as a texture,
    // used for every "glyph" that needs to face the camera — the matrix rain
    // and the binary packets travelling the hero globe's arcs. Pass white to
    // get a neutral glyph that a material's vertexColors can then tint/dim.
    function makeGlyphTexture(ch, colorHex, blurPx) {
      var size = 64;
      var cnv = document.createElement('canvas');
      cnv.width = size; cnv.height = size;
      var c = cnv.getContext('2d');
      c.font = '700 42px "JetBrains Mono", monospace';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      if (blurPx) c.filter = 'blur(' + blurPx + 'px)';
      c.shadowColor = colorHex;
      c.shadowBlur = 14;
      c.fillStyle = colorHex;
      c.fillText(ch, size / 2, size / 2 + 2);
      c.shadowBlur = 2;
      c.fillText(ch, size / 2, size / 2 + 2);
      var tex = new THREE.CanvasTexture(cnv);
      tex.needsUpdate = true;
      return tex;
    }

    // A soft round glow, used for the deep starfield behind the rain — a hard
    // square point here would read as digital noise rather than distant light.
    function makeSoftDotTexture() {
      var size = 64;
      var cnv = document.createElement('canvas');
      cnv.width = size; cnv.height = size;
      var c = cnv.getContext('2d');
      var g = c.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.35, 'rgba(255,255,255,0.55)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = g;
      c.fillRect(0, 0, size, size);
      var tex = new THREE.CanvasTexture(cnv);
      tex.needsUpdate = true;
      return tex;
    }

    function initMatrixRain2D() {
      var cv = document.createElement('canvas');
      cv.id = 'matrix';
      cv.setAttribute('aria-hidden', 'true');
      document.body.appendChild(cv);
      var ctx = cv.getContext('2d');

      var GLYPHS = 'アカサタナハマヤラワィゥヴカ0123456789ABCDEF<>[]{}/\\|=+*#$%'.split('');
      var small = innerWidth < 640;
      var FONT = small ? 20 : 16, cols = 0, drops = [], speeds = [], dpr = 1;

      function size() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = Math.floor(innerWidth * dpr);
        cv.height = Math.floor(innerHeight * dpr);
        cv.style.width = innerWidth + 'px';
        cv.style.height = innerHeight + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        cols = Math.ceil(innerWidth / FONT);
        drops = []; speeds = [];
        for (var i = 0; i < cols; i++) {
          drops.push(Math.random() * -60);
          speeds.push(0.35 + Math.random() * 0.55);
        }
      }

      var fadeAlpha = 0.09;
      function refreshFade() {
        fadeAlpha = parseFloat(getComputedStyle(document.documentElement)
                     .getPropertyValue('--matrix-fade')) || 0.09;
      }

      var last = 0, FPS = small ? 15 : 24;
      function frame(ts) {
        requestAnimationFrame(frame);
        if (document.hidden) return;
        if (ts - last < 1000 / FPS) return;
        last = ts;

        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0,0,0,' + fadeAlpha + ')';
        ctx.fillRect(0, 0, innerWidth, innerHeight);
        ctx.globalCompositeOperation = 'source-over';
        ctx.font = FONT + 'px ' + (getComputedStyle(document.body).getPropertyValue('--mono') || 'monospace');

        var col = rainColor();
        for (var i = 0; i < cols; i++) {
          var ch = GLYPHS[(Math.random() * GLYPHS.length) | 0];
          var y = drops[i] * FONT;
          if (y > 0) {
            ctx.fillStyle = col;
            ctx.globalAlpha = 0.85;
            ctx.fillText(ch, i * FONT, y);
            ctx.globalAlpha = 0.35;
            ctx.fillText(GLYPHS[(Math.random() * GLYPHS.length) | 0], i * FONT, y - FONT);
            ctx.globalAlpha = 1;
          }
          drops[i] += speeds[i];
          if (y > innerHeight && Math.random() > 0.975) drops[i] = Math.random() * -20;
        }
      }

      size(); refreshFade();
      addEventListener('resize', function () { size(); refreshFade(); }, { passive: true });
      requestAnimationFrame(frame);
    }

    function initMatrixRain3D() {
      var cv = document.createElement('canvas');
      cv.id = 'matrix';
      cv.setAttribute('aria-hidden', 'true');
      document.body.appendChild(cv);

      var renderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: false, alpha: true });
      } catch (e) {
        cv.remove();
        initMatrixRain2D();
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));

      var scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x050806, 0.0062);

      var camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 1, 500);
      camera.position.set(0, 0, 80);

      var small = innerWidth < 640;
      var COLUMNS = small ? 55 : 130;
      var TRAIL = 15;
      var SPACING = 3.1;
      var depths = [-30, -90, -170, -260];
      var TOTAL = COLUMNS * TRAIL;

      var heads = [];
      var accentColor = new THREE.Color(rainColor());
      var whiteColor = new THREE.Color(0xffffff);

      // A representative slice of the site's original glyph set (full katakana
      // + alphanumeric + symbol mix lives in the 2D fallback below) — enough
      // variety to read as real Matrix code rather than a wall of 0s and 1s,
      // without needing dozens of texture groups.
      var GLYPH_POOL = ['0', '1', '8', '#', 'ア', 'カ', 'ナ', 'ヴ'];
      var GLYPH_COUNT = GLYPH_POOL.length;

      // Each (column, trail-slot) is permanently assigned one glyph at
      // creation, so a slot keeps its character as it falls and loops — same
      // trick real matrix-rain implementations use rather than re-rolling
      // every frame. Each column is also permanently assigned a depth tier
      // (near/mid/far), matching the depth band it was seeded into, so
      // foreground columns render with a sharp glyph texture and background
      // columns with a pre-blurred one — real depth-of-field, baked into the
      // texture rather than faked with a runtime blur shader.
      var depthTierOf = [0, 1, 2, 2]; // maps depths[] index -> tier (0=near,1=mid,2=far)
      var TIER_COUNT = 3;
      var GROUP_COUNT = TIER_COUNT * GLYPH_COUNT;
      var glyphIdxOf = new Uint8Array(TOTAL);
      var tierOf = new Uint8Array(TOTAL);
      var bufIndex = new Int32Array(TOTAL);
      var groupCount = new Array(GROUP_COUNT).fill(0); // index = tier*GLYPH_COUNT + glyphIdx
      for (var k = 0; k < TOTAL; k++) {
        var col = Math.floor(k / TRAIL);
        var tier = depthTierOf[col % depths.length];
        var glyphIdx = (Math.random() * GLYPH_COUNT) | 0;
        glyphIdxOf[k] = glyphIdx;
        tierOf[k] = tier;
        var gi = tier * GLYPH_COUNT + glyphIdx;
        bufIndex[k] = groupCount[gi]++;
      }

      var groupPositions = [], groupColors = [];
      for (var gi2 = 0; gi2 < GROUP_COUNT; gi2++) {
        groupPositions.push(new Float32Array(groupCount[gi2] * 3));
        groupColors.push(new Float32Array(groupCount[gi2] * 3));
      }

      function visibleHalfSize(z) {
        var dist = camera.position.z - z;
        var vFov = (camera.fov * Math.PI) / 180;
        var h = 2 * Math.tan(vFov / 2) * dist;
        return { w: (h * camera.aspect) / 2, h: h / 2 };
      }

      function seedColumns() {
        heads.length = 0;
        for (var c = 0; c < COLUMNS; c++) {
          var z = depths[c % depths.length] + (Math.random() * 20 - 10);
          var bounds = visibleHalfSize(z);
          var x = (Math.random() * 2 - 1) * bounds.w * 1.05;
          var speed = Math.max(0.35, (28 + z * 0.09) * (0.6 + Math.random() * 0.6) * 0.045);
          heads.push({
            x: x, z: z,
            y: Math.random() * bounds.h * 2 - bounds.h,
            speed: speed,
            top: bounds.h + SPACING * TRAIL,
            bottom: -bounds.h - SPACING * TRAIL
          });
        }
      }
      seedColumns();

      var tmpHeadColor = new THREE.Color();
      function layout() {
        for (var c = 0; c < COLUMNS; c++) {
          var head = heads[c];
          for (var i = 0; i < TRAIL; i++) {
            var k = c * TRAIL + i;
            var b = Math.max(0, 1 - i / TRAIL);
            b = i === 0 ? 1.6 : b * b;
            var x = head.x, y = head.y + i * SPACING, z = head.z;
            var gi = tierOf[k] * GLYPH_COUNT + glyphIdxOf[k];
            var pos = groupPositions[gi];
            var colArr = groupColors[gi];
            var idx = bufIndex[k] * 3;
            pos[idx] = x; pos[idx + 1] = y; pos[idx + 2] = z;
            if (i === 0) {
              // the leading character of each column glows near-white, the
              // classic Matrix "head" — a genuine white blend, not just a
              // brightness bump on the accent colour
              tmpHeadColor.copy(accentColor).lerp(whiteColor, 0.65);
              colArr[idx] = tmpHeadColor.r;
              colArr[idx + 1] = tmpHeadColor.g;
              colArr[idx + 2] = tmpHeadColor.b;
            } else {
              colArr[idx] = accentColor.r * b;
              colArr[idx + 1] = accentColor.g * b;
              colArr[idx + 2] = accentColor.b * b;
            }
          }
        }
      }
      layout();

      // sharp up close, progressively blurred with depth — the blur is baked
      // into the texture itself (canvas filter, at draw time), not a runtime
      // effect, so it's cheap and can't misbehave per-frame
      var blurByTier = [0, 1.6, 3.2];
      var texByTierGlyph = [];
      for (var ti = 0; ti < TIER_COUNT; ti++) {
        var row = [];
        for (var gch = 0; gch < GLYPH_COUNT; gch++) {
          row.push(makeGlyphTexture(GLYPH_POOL[gch], '#ffffff', blurByTier[ti]));
        }
        texByTierGlyph.push(row);
      }

      var geos = [];
      for (var gi3 = 0; gi3 < GROUP_COUNT; gi3++) {
        var g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(groupPositions[gi3], 3));
        g.setAttribute('color', new THREE.BufferAttribute(groupColors[gi3], 3));
        geos.push(g);
      }

      function rainMaterial(tex, sizePx) {
        return new THREE.PointsMaterial({
          map: tex,
          size: sizePx,
          vertexColors: true,
          transparent: true,
          opacity: 0.95,
          sizeAttenuation: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
      }

      // slightly larger points for blurrier tiers compensates for the softer
      // texture reading smaller/dimmer than the crisp one at the same size
      var sizeByTier = [6.2, 6.6, 7.2];
      for (var ti2 = 0; ti2 < TIER_COUNT; ti2++) {
        for (var gch2 = 0; gch2 < GLYPH_COUNT; gch2++) {
          var idx2 = ti2 * GLYPH_COUNT + gch2;
          scene.add(new THREE.Points(geos[idx2], rainMaterial(texByTierGlyph[ti2][gch2], sizeByTier[ti2])));
        }
      }

      // deep starfield: sparse, dim points scattered far behind the rain columns,
      // so the backdrop reads as open space rather than a flat wall of code
      var STAR_COUNT = small ? 200 : 420;
      var starPos = new Float32Array(STAR_COUNT * 3);
      var starCol = new Float32Array(STAR_COUNT * 3);
      var starPhase = new Float32Array(STAR_COUNT);
      var starBase = new Float32Array(STAR_COUNT);
      var starTint = new THREE.Color(rainColor());
      var sb = visibleHalfSize(-450);
      for (var s = 0; s < STAR_COUNT; s++) {
        starPos[s * 3] = (Math.random() * 2 - 1) * sb.w * 1.4;
        starPos[s * 3 + 1] = (Math.random() * 2 - 1) * sb.h * 1.4;
        starPos[s * 3 + 2] = -320 - Math.random() * 260;
        var isGreen = Math.random() < 0.35;
        var brightness = 0.25 + Math.random() * 0.5;
        starBase[s] = brightness;
        var col = isGreen ? starTint : new THREE.Color(0xffffff);
        starCol[s * 3] = col.r * brightness;
        starCol[s * 3 + 1] = col.g * brightness;
        starCol[s * 3 + 2] = col.b * brightness;
        starPhase[s] = Math.random() * Math.PI * 2;
      }
      var starGeo = new THREE.BufferGeometry();
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
      starGeo.setAttribute('color', new THREE.BufferAttribute(starCol, 3));
      var starMat = new THREE.PointsMaterial({
        map: makeSoftDotTexture(), size: 2.4, vertexColors: true, transparent: true,
        opacity: 0.85, sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false
      });
      var starField = new THREE.Points(starGeo, starMat);
      scene.add(starField);

      function resize() {
        renderer.setSize(innerWidth, innerHeight);
        camera.aspect = innerWidth / innerHeight;
        camera.updateProjectionMatrix();
        seedColumns();
      }
      resize();
      addEventListener('resize', resize, { passive: true });

      var mouseX = 0, mouseY = 0, camX = 0, camY = 0;
      addEventListener('mousemove', function (e) {
        mouseX = e.clientX / innerWidth - 0.5;
        mouseY = e.clientY / innerHeight - 0.5;
      }, { passive: true });

      var clock = new THREE.Clock();
      var elapsed = 0;
      function animate() {
        requestAnimationFrame(animate);
        if (document.hidden) return;
        var dt = Math.min(clock.getDelta(), 0.05);
        elapsed += dt;

        for (var c = 0; c < COLUMNS; c++) {
          var head = heads[c];
          head.y -= head.speed;
          if (head.y < head.bottom) head.y = head.top;
        }
        layout();
        for (var gu = 0; gu < geos.length; gu++) {
          geos[gu].attributes.position.needsUpdate = true;
          geos[gu].attributes.color.needsUpdate = true;
        }

        // twinkle the starfield
        var starAttr = starGeo.attributes.color;
        for (var s2 = 0; s2 < STAR_COUNT; s2++) {
          var tw = 0.65 + 0.35 * Math.sin(elapsed * 0.6 + starPhase[s2]);
          var b2 = starBase[s2] * tw;
          var idx2 = s2 * 3;
          starAttr.array[idx2] = (starCol[idx2] / starBase[s2]) * b2;
          starAttr.array[idx2 + 1] = (starCol[idx2 + 1] / starBase[s2]) * b2;
          starAttr.array[idx2 + 2] = (starCol[idx2 + 2] / starBase[s2]) * b2;
        }
        starAttr.needsUpdate = true;

        // mouse parallax plus a slow autonomous drift, so the scene keeps
        // breathing even when nobody's moving the cursor
        var driftX = Math.sin(elapsed * 0.09) * 2.2;
        var driftY = Math.cos(elapsed * 0.07) * 1.1;
        camX += (mouseX * 5 + driftX - camX) * 0.02;
        camY += (-mouseY * 3 + driftY - camY) * 0.02;
        camera.position.x = camX;
        camera.position.y = camY;
        camera.lookAt(0, 0, -100);

        renderer.render(scene, camera);
      }
      animate();
    }


    // --- typed role line ---
    var typed = document.querySelector('[data-typed]');
    if (typed) {
      var words = JSON.parse(typed.getAttribute('data-typed'));
      var w = 0, c = 0, del = false;
      var out = typed.querySelector('.typed-text');
      (function tick() {
        var word = words[w];
        c += del ? -1 : 1;
        out.textContent = word.slice(0, c);
        var wait = del ? 45 : 85;
        if (!del && c === word.length) { del = true; wait = 1600; }
        else if (del && c === 0) { del = false; w = (w + 1) % words.length; wait = 300; }
        setTimeout(tick, wait);
      })();
    }
  });
})();
