(function () {
  const zones = [
    ['top_left_status', 'status RP / alerts', 'RP, resonance status, unlock hints'],
    ['top_center_identity', 'identity', 'SUB-META title, config glyph'],
    ['top_right_navigation', 'navigation', 'back, mode, safe actions'],
    ['middle_left_prg', 'PRG workspace', '4 osie × (R1 + ODB/ext) + 3 R2 sockets'],
    ['middle_center_resonance_core', 'resonance core', 'R2 bridges, R3 stabilizer, central R4, DS module'],
    ['middle_right_world', 'WORLD workspace', '4 osie × (2xR1 + ext) + 3 R2 sockets'],
    ['bottom_left_inventory', 'inventory bank', 'wide multi-card storage'],
    ['bottom_center_forge', 'mini forge portal', 'small entry to deep forge panel'],
    ['bottom_right_card_detail', 'card detail reader', 'large inspect panel balanced with inventory']
  ];

  const root = document.getElementById('wireframeRoot');
  const grid = document.getElementById('cockpitGrid');
  const mobileWorkspace = document.getElementById('mobileWorkspace');

  function zoneContent(id) {
    if (id === 'middle_left_prg') return '<div class="axis-grid"><div>Axis 1: R1 | ODB</div><div>Axis 2: R1 | ODB</div><div>Axis 3: R1 | ODB</div><div>Axis 4: R1 | ODB</div></div><div class="socket-row">PRG R2 bridges: [R2-A] [R2-B] [R2-C]</div>';
    if (id === 'middle_right_world') return '<div class="axis-grid"><div>Axis 1: R1 | R1 | EXT</div><div>Axis 2: R1 | R1 | EXT</div><div>Axis 3: R1 | R1 | EXT</div><div>Axis 4: R1 | R1 | EXT</div></div><div class="socket-row">WORLD R2 bridges: [R2-A] [R2-B] [R2-C]</div>';
    if (id === 'middle_center_resonance_core') return '<div class="core-shape"><div class="r4">R4 UNITY</div><div class="r3">R3 stabilization ring</div><div class="ds">DS module</div></div><div class="socket-row">R2 bridge labels: PRG↔WORLD A/B/C</div>';
    if (id === 'bottom_left_inventory') return '<div class="cards-bank">[R1][R1][R1][R2][R2][R3][R4][DS][R1][R2]</div>';
    if (id === 'bottom_center_forge') return '<div class="mini-forge">mini Kuźnia → enter deep forge</div>';
    if (id === 'bottom_right_card_detail') return '<div class="detail-preview">Selected card detail / lore / stats / links</div>';
    return '';
  }

  function zoneEl([id, role, sample]) {
    const el = document.createElement('article');
    el.className = `zone zone-${id}`;
    el.innerHTML = `<strong>${id}</strong><div class="meta">rola: ${role}<br>elementy: ${sample}<br>future hooks: connectors / unlock states</div>
      ${zoneContent(id)}
      <div class="bleed-box"></div><div class="mount-box"></div><div class="interactive-box"></div><div class="pivot-dot"></div>
      <i class="anchor-dot a-top" title="anchor:top"></i><i class="anchor-dot a-right" title="anchor:right"></i><i class="anchor-dot a-bottom" title="anchor:bottom"></i><i class="anchor-dot a-left" title="anchor:left"></i>`;
    return el;
  }

  zones.forEach((z) => grid.appendChild(zoneEl(z)));

  function renderMobileWorkspace(selected) {
    const names = ['PRG', 'WORLD', 'CORE', 'INVENTORY', 'FORGE', 'DETAIL'];
    const samples = {
      PRG: '4 osie: (R1+ODB) ×4, 3 R2 sockets',
      WORLD: '4 osie: (2R1+EXT) ×4, 3 R2 sockets',
      CORE: 'resonance core: R2/R3/R4/DS',
      INVENTORY: 'wide bank cards compact list',
      FORGE: 'mini Kuźnia portal',
      DETAIL: 'card reader panel'
    };
    mobileWorkspace.innerHTML = `<h2>Mobile model 9 stref (content-driven)</h2>
      <p>Stałe: status + identity + nav + resonance core. Przełączane: workspace.</p>
      <div class="workspace-tabs">${names.map(n=>`<button data-ws="${n}" ${selected===n?'aria-current="true"':''}>${n}</button>`).join('')}</div>
      <div class="workspace-panel"><strong>${selected}</strong><br>${samples[selected]}</div>`;
    mobileWorkspace.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => renderMobileWorkspace(b.dataset.ws)));
  }
  renderMobileWorkspace('CORE');

  document.querySelectorAll('[data-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-mode]').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      root.className = `mode-${btn.dataset.mode}`;
    });
  });
})();
