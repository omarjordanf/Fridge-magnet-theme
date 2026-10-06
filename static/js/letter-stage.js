(() => {
  const heading = document.querySelector('#site-heading');
  const field = document.querySelector('#letter-field');
  const world = document.querySelector('#magnet-world');
  if (!heading || !field || !world) return;

  document.body.classList.add('home');
  const syncHomeView = () => document.body.classList.toggle('is-feed', window.location.hash === '#lifefeed');
  syncHomeView();
  window.addEventListener('hashchange', syncHomeView);

  document.body.classList.add('letters-active');
  const sourceWords = heading.textContent.trim().split(/\s+/u);
  const displayRows = sourceWords.length === 3 ? [`${sourceWords[0]} ${sourceWords[1]}`, sourceWords[2]] : sourceWords;
  const words = displayRows.map((word) => Array.from(word));
  const letterCount = words.reduce((count, word) => count + word.filter((character) => !/\s/u.test(character)).length, 0);
  const colors = [
    ['#f4cf16', '#ad8909'], ['#ef563b', '#a62d2a'], ['#fa8c28', '#ae5518'],
    ['#36a84d', '#1d7136'], ['#0799c5', '#096583'], ['#5843a1', '#38276d']
  ];
  const typeStyles = ['round', 'round', 'round', 'round', 'serif', 'tall'];
  const bodies = [];
  const activeContacts = new Set();
  let previousColor = -1;

  function setPosition(node, x, y) {
    node.dataset.x = String(x);
    node.dataset.y = String(y);
    node.style.setProperty('--x', `${x}px`);
    node.style.setProperty('--y', `${y}px`);
  }

  function reset(node) {
    node.dataset.bumpVersion = String(Number(node.dataset.bumpVersion || 0) + 1);
    setPosition(node, Number(node.dataset.homeX || 0), Number(node.dataset.homeY || 0));
    node.style.setProperty('--kick', '0deg');
  }

  function fitField() {
    const longestRowUnits = Math.max(...words.map((word) => word.reduce((total, character) => total + (character === ' ' ? 0.28 : 1), 0)));
    const sideSpace = window.innerWidth <= 600 ? 24 : 112;
    const width = Math.max(18, Math.min(220, (window.innerWidth - sideSpace) / longestRowUnits, (window.innerHeight - 150) / (words.length * 1.55)));
    const header = document.querySelector('.site-header');
    const footer = document.querySelector('.site-footer');
    const stageTop = Math.max(88, header ? header.getBoundingClientRect().bottom : 88);
    const stageBottom = Math.max(64, footer ? window.innerHeight - footer.getBoundingClientRect().top : 64);
    document.documentElement.style.setProperty('--stage-top', `${stageTop}px`);
    document.documentElement.style.setProperty('--stage-bottom', `${stageBottom}px`);
    field.style.setProperty('--mark-size', `${width}px`);
    bodies.forEach((body) => {
      body.style.setProperty('--rest-x', `${(Number(body.dataset.restX) * width).toFixed(1)}px`);
      body.style.setProperty('--rest-y', `${(Number(body.dataset.restY) * width).toFixed(1)}px`);
    });
  }

  function shape(node) {
    const glyph = node.querySelector('.magnet-glyph');
    const rect = glyph.getBoundingClientRect();
    const cushion = Math.max(rect.width, rect.height) * 0.11;
    return {
      left: rect.left - cushion, right: rect.right + cushion,
      top: rect.top - cushion, bottom: rect.bottom + cushion,
      x: rect.left + rect.width / 2, y: rect.top + rect.height / 2
    };
  }

  function bump(target, dx, dy, amount) {
    const version = Number(target.dataset.bumpVersion || 0) + 1;
    target.dataset.bumpVersion = String(version);
    const x = Number(target.dataset.x || 0);
    const y = Number(target.dataset.y || 0);
    setPosition(target, x + dx * amount, y + dy * amount);
    const spin = Math.random() < 0.5 ? -1 : 1;
    target.style.setProperty('--kick', `${spin * (6 + Math.random() * 9)}deg`);
    window.setTimeout(() => {
      if (Number(target.dataset.bumpVersion) !== version) return;
      target.style.setProperty('--kick', '0deg');
    }, 300);
  }

  function collide(active) {
    bodies.forEach((other) => {
      if (other === active) return;
      const a = shape(active);
      const b = shape(other);
      const overlapX = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const overlapY = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      const key = [active.dataset.physicsId, other.dataset.physicsId].sort().join(':');
      if (overlapX <= 0 || overlapY <= 0) {
        activeContacts.delete(key);
        return;
      }
      const horizontal = overlapX < overlapY;
      const dx = horizontal ? (b.x >= a.x ? 1 : -1) : 0;
      const dy = horizontal ? 0 : (b.y >= a.y ? 1 : -1);
      const penetration = horizontal ? overlapX : overlapY;
      // Separate the held letter from the contact edge; the struck letter gets a springy nudge.
      setPosition(active, Number(active.dataset.x) - dx * (penetration + 1), Number(active.dataset.y) - dy * (penetration + 1));
      if (activeContacts.has(key)) return;
      activeContacts.add(key);
      bump(other, dx, dy, Math.min(penetration * 0.25 + 16, 48));
    });
  }

  function settleOverlaps(updateHome = false) {
    world.classList.add('is-settling');
    for (let pass = 0; pass < 80; pass += 1) {
      let foundOverlap = false;
      for (let i = 0; i < bodies.length; i += 1) {
        for (let j = i + 1; j < bodies.length; j += 1) {
          const a = shape(bodies[i]);
          const b = shape(bodies[j]);
          const overlapX = Math.min(a.right, b.right) - Math.max(a.left, b.left);
          const overlapY = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          if (overlapX <= 0 || overlapY <= 0) continue;
          foundOverlap = true;
          const horizontal = overlapX < overlapY;
          const dx = horizontal ? (b.x >= a.x ? 1 : -1) : 0;
          const dy = horizontal ? 0 : (b.y >= a.y ? 1 : -1);
          const penetration = horizontal ? overlapX : overlapY;
          const push = penetration * 0.52 + 1;
          setPosition(bodies[i], Number(bodies[i].dataset.x) - dx * push, Number(bodies[i].dataset.y) - dy * push);
          setPosition(bodies[j], Number(bodies[j].dataset.x) + dx * push, Number(bodies[j].dataset.y) + dy * push);
        }
      }
      if (!foundOverlap) break;
    }
    // Keep each line of the title comfortably inside the visible canvas after a shove.
    const safe = window.innerWidth <= 600 ? 16 : 36;
    const viewport = world.getBoundingClientRect();
    const rows = [...new Set(bodies.map((body) => body.parentElement))];
    rows.forEach((row) => {
      const rowBodies = bodies.filter((body) => body.parentElement === row);
      const bounds = rowBodies.map(shape);
      const left = Math.min(...bounds.map((box) => box.left));
      const right = Math.max(...bounds.map((box) => box.right));
      const shift = left < viewport.left + safe ? viewport.left + safe - left
        : right > viewport.right - safe ? viewport.right - safe - right : 0;
      if (shift) rowBodies.forEach((body) => setPosition(body, Number(body.dataset.x) + shift, Number(body.dataset.y)));
    });
    // Center the complete, settled phrase in the available canvas.
    const allBounds = bodies.map(shape);
    const left = Math.min(...allBounds.map((box) => box.left));
    const right = Math.max(...allBounds.map((box) => box.right));
    const top = Math.min(...allBounds.map((box) => box.top));
    const bottom = Math.max(...allBounds.map((box) => box.bottom));
    const targetX = viewport.left + (viewport.width - (right - left)) / 2 - left;
    const targetY = viewport.top + (viewport.height - (bottom - top)) / 2 - top;
    const shiftX = Math.max(viewport.left + safe - left, Math.min(viewport.right - safe - right, targetX));
    const shiftY = Math.max(viewport.top + safe - top, Math.min(viewport.bottom - safe - bottom, targetY));
    bodies.forEach((body) => setPosition(body, Number(body.dataset.x) + shiftX, Number(body.dataset.y) + shiftY));
    if (updateHome) bodies.forEach((body) => {
      body.dataset.homeX = body.dataset.x;
      body.dataset.homeY = body.dataset.y;
    });
    requestAnimationFrame(() => requestAnimationFrame(() => world.classList.remove('is-settling')));
  }

  function addInteraction(node, index) {
    node.dataset.physicsId = String(index);
    node.dataset.x = '0';
    node.dataset.y = '0';
    node.addEventListener('keydown', (event) => {
      const distance = event.shiftKey ? 48 : 16;
      const directions = { ArrowLeft: [-distance, 0], ArrowRight: [distance, 0], ArrowUp: [0, -distance], ArrowDown: [0, distance] };
      if (event.key === 'Escape') {
        event.preventDefault();
        bodies.forEach(reset);
        return;
      }
      const move = directions[event.key];
      if (!move) return;
      event.preventDefault();
      setPosition(node, Number(node.dataset.x) + move[0], Number(node.dataset.y) + move[1]);
      collide(node);
    });

    let drag;
    node.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      drag = { x: event.clientX, y: event.clientY, startX: Number(node.dataset.x || 0), startY: Number(node.dataset.y || 0) };
      node.classList.add('is-dragging');
      node.setPointerCapture(event.pointerId);
    });
    node.addEventListener('pointermove', (event) => {
      if (!drag || !node.hasPointerCapture(event.pointerId)) return;
      setPosition(node, drag.startX + event.clientX - drag.x, drag.startY + event.clientY - drag.y);
      collide(node);
    });
    const finish = (event) => {
      if (drag && event.type === 'pointerup') {
        setPosition(node, drag.startX + event.clientX - drag.x, drag.startY + event.clientY - drag.y);
        collide(node);
        settleOverlaps(true);
      }
      drag = null;
      node.classList.remove('is-dragging');
      activeContacts.clear();
    };
    node.addEventListener('pointerup', finish);
    node.addEventListener('pointercancel', finish);
    bodies.push(node);
  }

  words.forEach((word) => {
    const row = document.createElement('div');
    row.className = 'stage-word';
    field.appendChild(row);
    word.forEach((character) => {
      if (/\s/u.test(character)) {
        const spacer = document.createElement('span');
        spacer.className = 'stage-space';
        spacer.setAttribute('aria-hidden', 'true');
        row.appendChild(spacer);
        return;
      }
      const index = bodies.length;
      const button = document.createElement('button');
      const glyph = document.createElement('span');
      button.type = 'button';
      button.className = 'stage-letter';
      button.classList.add(`stage-letter--${typeStyles[Math.floor(Math.random() * typeStyles.length)]}`);
      button.setAttribute('aria-describedby', 'letter-help');
      button.setAttribute('aria-label', `Move letter ${character}, ${index + 1} of ${letterCount}`);
      button.style.setProperty('--tilt', `${(Math.random() * 48 - 24).toFixed(1)}deg`);
      button.style.setProperty('--leave-delay', `${Math.floor(Math.random() * 110)}ms`);
      button.dataset.restX = (Math.random() * 0.28 - 0.14).toFixed(3);
      button.dataset.restY = (Math.random() * 0.48 - 0.24).toFixed(3);
      let colorIndex = Math.floor(Math.random() * (colors.length - 1));
      if (colorIndex >= previousColor) colorIndex += 1;
      previousColor = colorIndex;
      button.style.setProperty('--magnet-color', colors[colorIndex][0]);
      button.style.setProperty('--magnet-side', colors[colorIndex][1]);
      glyph.className = 'magnet-glyph';
      glyph.textContent = character.toLocaleUpperCase();
      button.appendChild(glyph);
      row.appendChild(button);
      addInteraction(button, index);
    });
  });

  fitField();
  settleOverlaps(true);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      fitField();
      settleOverlaps(true);
    });
  }
  window.addEventListener('resize', fitField, { passive: true });

  document.querySelectorAll('.site-header a[href]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (!document.body.classList.contains('home') || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download')) return;
      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin || destination.pathname === window.location.pathname) return;
      event.preventDefault();
      document.body.classList.add('is-leaving');
      window.setTimeout(() => { window.location.href = destination.href; }, 260);
    });
  });
})();
