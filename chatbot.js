/* ==========================================================================
   LEVIATHAN — conversational interface
   Collects name, age, location, email and the visitor's situation, then
   emails the whole thing to the hero's inbox.
   ========================================================================== */
(function () {
  'use strict';

  var CFG = window.LEVIATHAN_CONFIG || {};
  var PLACEHOLDER = !CFG.heroEmail || /your-email@example\.com/i.test(CFG.heroEmail);
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var chat = document.getElementById('chat');
  var log = document.getElementById('chatLog');
  var form = document.getElementById('chatForm');
  var input = document.getElementById('chatInput');
  var quick = document.getElementById('chatQuick');
  var status = document.getElementById('chatStatus');
  var hail = document.getElementById('hail');
  var hailDot = document.getElementById('hailDot');
  var bar = form;

  var visitor = {};
  var step = 0;
  var busy = false;
  var started = false;

  /* ── rendering ─────────────────────────────────────────────────────────── */
  function scroll() { log.scrollTop = log.scrollHeight; }

  function bubble(text, who) {
    var el = document.createElement('div');
    el.className = 'msg msg--' + who;
    el.textContent = text;
    log.appendChild(el);
    scroll();
    return el;
  }

  function card(title, rows) {
    var el = document.createElement('div');
    el.className = 'msg msg--card';
    var dl = rows.map(function (r) {
      return '<dt>' + r[0] + '</dt><dd></dd>';
    }).join('');
    el.innerHTML = '<h4></h4><dl>' + dl + '</dl>';
    el.querySelector('h4').textContent = title;
    var dds = el.querySelectorAll('dd');
    rows.forEach(function (r, i) { dds[i].textContent = r[1]; });
    log.appendChild(el);
    scroll();
  }

  function typing(ms, then) {
    busy = true;
    bar.classList.add('is-locked');
    status.textContent = 'Typing…';
    var t = document.createElement('div');
    t.className = 'typing';
    t.innerHTML = '<span></span><span></span><span></span>';
    log.appendChild(t);
    scroll();
    setTimeout(function () {
      t.remove();
      status.textContent = 'Listening';
      busy = false;
      bar.classList.remove('is-locked');
      then();
    }, reduce ? 120 : ms);
  }

  /* Say one or more lines, paced like someone actually typing them. */
  function say(lines, done) {
    lines = [].concat(lines);
    (function next(i) {
      if (i >= lines.length) { if (done) done(); return; }
      var text = lines[i];
      var ms = Math.min(1500, 420 + text.length * 16);
      typing(ms, function () {
        bubble(text, 'hero');
        next(i + 1);
      });
    })(0);
  }

  function chips(options) {
    quick.innerHTML = '';
    if (!options || !options.length) { quick.classList.remove('is-on'); return; }
    options.forEach(function (label) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.addEventListener('click', function () {
        chips(null);
        submit(label);
      });
      quick.appendChild(b);
    });
    quick.classList.add('is-on');
  }

  /* ── validation ────────────────────────────────────────────────────────── */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

  /* ── the conversation ─────────────────────────────────────────────────── */
  var script = [
    { // 0 — name
      ask: [
        "I'm Leviathan. The sea brought your message to me, so I'm listening.",
        "Before anything else — what should I call you?"
      ],
      take: function (v) {
        var name = v.replace(/^(my name is|i am|i'm|its|it's|this is)\s+/i, '').trim();
        if (name.length < 2) return { error: "That's shorter than a name. Give me something I can call you." };
        if (name.length > 40) return { error: "Easier if you keep it short — just the name you go by." };
        visitor.name = name.charAt(0).toUpperCase() + name.slice(1);
        return { ok: ["Good to meet you, " + visitor.name + ".", "How old are you? It tells me how careful I need to be with you."] };
      }
    },
    { // 1 — age
      ask: null,
      take: function (v) {
        var n = parseInt(v.replace(/\D+/g, ''), 10);
        if (isNaN(n)) return { error: "A number is enough — just your age." };
        if (n < 5 || n > 110) return { error: "That can't be right. Try again — how old are you?" };
        visitor.age = n;
        var line = n < 18
          ? "Understood. You're young, so I'll be direct and I'll keep an adult you trust in the picture."
          : "Understood.";
        return { ok: [line, "Where are you right now? A city or a coastline is enough."] };
      }
    },
    { // 2 — location
      ask: null,
      take: function (v) {
        if (v.trim().length < 2) return { error: "I need a place. A town, a district, a stretch of coast." };
        visitor.location = v.trim();
        return { ok: ["I know those waters.", "If I lose you mid-conversation, where do I write? Your email address."] };
      }
    },
    { // 3 — email
      ask: null,
      take: function (v) {
        var mail = v.trim().replace(/\s+/g, '');
        if (!EMAIL_RE.test(mail)) return { error: "That address won't hold water. It should look like name@domain.com." };
        visitor.email = mail;
        return { ok: ["Saved.", "How fast is this moving?"], chips: ['Someone is in danger now', 'Today or tomorrow', 'No rush, it just matters'] };
      }
    },
    { // 4 — urgency
      ask: null,
      take: function (v) {
        visitor.urgency = v.trim().slice(0, 60);
        var open = /danger/i.test(visitor.urgency)
          ? "Then we don't waste words. If anyone is in the water or hurt, call emergency services too — I work alongside them, not instead of them."
          : "Alright.";
        return { ok: [open, "So… tell me. How can I help you?"] };
      }
    },
    { // 5 — grievance
      ask: null,
      take: function (v) {
        if (v.trim().length < 12) return { error: "Give me more than that. What's happening, and what do you need from me?" };
        visitor.message = v.trim();
        return {
          ok: ["I have it. Let me read it back before I carry it up."],
          then: function () {
            card("What I'm taking with me", [
              ['Name', visitor.name],
              ['Age', String(visitor.age)],
              ['Location', visitor.location],
              ['Email', visitor.email],
              ['Urgency', visitor.urgency],
              ['Situation', visitor.message]
            ]);
            say("Is that right?", function () {
              chips(['Send it to Leviathan', 'Let me start over']);
            });
          }
        };
      }
    },
    { // 6 — confirm
      ask: null,
      take: function (v) {
        if (/start over|change|edit|no/i.test(v)) {
          restart(true);
          return { silent: true };
        }
        return { ok: null, then: deliver };
      }
    }
  ];

  /* ── message handling ─────────────────────────────────────────────────── */
  function submit(value) {
    if (busy) return;
    var text = (value !== undefined ? value : input.value).trim();
    if (!text) return;
    input.value = '';
    chips(null);
    bubble(text, 'you');

    if (/^(start over|reset|let me start over|send another message)$/i.test(text)) {
      restart(true);
      return;
    }

    if (step >= script.length) {           // conversation already finished
      say("Your message is already with me, " + (visitor.name || 'friend') + ". If something changed, start over and tell me again.", function () {
        chips(['Start over']);
      });
      return;
    }

    var res = script[step].take(text);

    if (res.error) { say(res.error); return; }
    if (res.silent) return;

    step++;
    if (res.ok && res.ok.length) {
      say(res.ok, function () {
        if (res.chips) chips(res.chips);
        if (res.then) res.then();
      });
    } else if (res.then) {
      res.then();
    }
  }

  form.addEventListener('submit', function (e) { e.preventDefault(); submit(); });

  /* ── delivery ─────────────────────────────────────────────────────────── */
  function reference() {
    return 'LVT-' + Date.now().toString(36).toUpperCase().slice(-5);
  }

  function payload() {
    var now = new Date();
    return {
      ref: reference(),
      name: visitor.name,
      age: visitor.age,
      location: visitor.location,
      email: visitor.email,
      urgency: visitor.urgency,
      message: visitor.message,
      submittedAt: now.toLocaleString(),
      iso: now.toISOString(),
      page: location.href
    };
  }

  function deliver() {
    var data = payload();
    status.textContent = 'Surfacing…';
    bar.classList.add('is-locked');

    archive(data);

    send(data)
      .then(function () {
        say([
          "It's sent. Your message is with me now — reference " + data.ref + ".",
          "Keep your phone near you, " + data.name + ". If the water turns before I reach you, move inland and call for help there. I'll do the rest."
        ], function () {
          status.textContent = 'Message received';
          chips(['Send another message']);
          step = 99;
        });
      })
      .catch(function (err) {
        console.error('[Leviathan] delivery failed:', err);
        say([
          "The current cut the line before your message surfaced.",
          "Nothing is lost — it's saved here. Try sending again, or write to me directly at " + (PLACEHOLDER ? 'the address in config.js' : CFG.heroEmail) + "."
        ], function () {
          status.textContent = 'Listening';
          bar.classList.remove('is-locked');
          chips(['Try sending again']);
          step = 6; // stay on confirm
        });
      });
  }

  function archive(data) {
    try {
      var all = JSON.parse(localStorage.getItem('leviathan:calls') || '[]');
      all.push(data);
      localStorage.setItem('leviathan:calls', JSON.stringify(all.slice(-50)));
    } catch (e) { /* storage unavailable — not fatal */ }
  }

  function bodyText(d) {
    return [
      'Someone has asked Leviathan for help.',
      '',
      'Reference : ' + d.ref,
      'Name      : ' + d.name,
      'Age       : ' + d.age,
      'Location  : ' + d.location,
      'Email     : ' + d.email,
      'Urgency   : ' + d.urgency,
      'Submitted : ' + d.submittedAt,
      '',
      'What they need help with:',
      d.message,
      '',
      'Sent from ' + d.page
    ].join('\n');
  }

  function send(d) {
    if (PLACEHOLDER || CFG.transport === 'none') {
      console.warn('[Leviathan] No delivery address set. Open js/config.js and set heroEmail.');
      console.info('[Leviathan] Message that would have been sent:\n' + bodyText(d));
      return new Promise(function (r) { setTimeout(r, 900); });
    }

    if (CFG.transport === 'emailjs') return sendViaEmailJS(d);
    return sendViaFormSubmit(d);
  }

  /* FormSubmit — no account, no backend. Activate once via their email. */
  function sendViaFormSubmit(d) {
    return fetch('https://formsubmit.co/ajax/' + encodeURIComponent(CFG.heroEmail), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        _subject: CFG.subject || 'Someone needs Leviathan\'s help',
        _template: 'table',
        _captcha: 'false',
        Reference: d.ref,
        Name: d.name,
        Age: d.age,
        Location: d.location,
        'Email address': d.email,
        Urgency: d.urgency,
        'Grievance / request': d.message,
        'Submitted at': d.submittedAt
      })
    }).then(function (r) {
      if (!r.ok) throw new Error('FormSubmit responded ' + r.status);
      return r.json();
    });
  }

  /* EmailJS — for anyone who already has an account. */
  function sendViaEmailJS(d) {
    var e = CFG.emailjs || {};
    return loadScript('https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js')
      .then(function () {
        window.emailjs.init({ publicKey: e.publicKey });
        return window.emailjs.send(e.serviceId, e.templateId, {
          to_email: CFG.heroEmail,
          subject: CFG.subject,
          ref: d.ref, name: d.name, age: d.age,
          location: d.location, email: d.email,
          urgency: d.urgency, message: d.message,
          submitted_at: d.submittedAt,
          body: bodyText(d)
        });
      });
  }

  function loadScript(src) {
    return new Promise(function (res, rej) {
      if (document.querySelector('script[src="' + src + '"]')) return res();
      var s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  /* ── open / close / restart ───────────────────────────────────────────── */
  function open() {
    chat.classList.add('is-open');
    chat.setAttribute('aria-hidden', 'false');
    document.body.classList.add('chat-open');
    hailDot.classList.remove('is-on');
    if (!started) { started = true; begin(); }
    setTimeout(function () { input.focus({ preventScroll: true }); }, 450);
  }

  function close() {
    chat.classList.remove('is-open');
    chat.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('chat-open');
    hail.focus({ preventScroll: true });
  }

  function begin() {
    say(script[0].ask);
  }

  function restart(announce) {
    visitor = {};
    step = 0;
    chips(null);
    log.innerHTML = '';
    bar.classList.remove('is-locked');
    status.textContent = 'Listening';
    if (announce) {
      var s = document.createElement('div');
      s.className = 'msg msg--sys';
      s.textContent = 'Starting over';
      log.appendChild(s);
    }
    begin();
  }

  hail.addEventListener('click', open);
  document.getElementById('chatClose').addEventListener('click', close);
  document.getElementById('chatRestart').addEventListener('click', function () { restart(true); });
  document.querySelectorAll('[data-open-chat]').forEach(function (b) {
    b.addEventListener('click', open);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && chat.classList.contains('is-open')) close();
  });

  /* Leviathan hails the visitor shortly after they enter the site. */
  document.addEventListener('leviathan:entered', function () {
    var delay = CFG.autoOpenDelay;
    if (!delay) return;
    setTimeout(function () {
      if (chat.classList.contains('is-open')) return;
      hailDot.classList.add('is-on');
      open();
    }, delay);
  });
})();
