(function () {
  const zones = [
    ['top_left_status', 'status / RP', 'lekki pas mikro statusu'],
    ['top_center_identity', 'SUB-META identity', 'tożsamość panelu / resonance cockpit'],
    ['top_right_navigation', 'navigation', 'wróć / view mode'],
    ['middle_left_prg', 'PRG wing', '4 pionowe osie + R2 bliżej rdzenia'],
    ['middle_center_resonance_core', 'resonance core', 'R4 centralne, 2xR3 boczne, DS moduł rdzenia'],
    ['middle_right_world', 'ŚWIAT wing', '4 osie poziomego charakteru, z pionowymi kartami'],
    ['bottom_left_inventory', 'inventory bank', 'szeroki bank pionowych mini kart'],
    ['bottom_center_forge', 'mini Kuźnia portal', 'wejście do deeper forge workspace'],
    ['bottom_right_card_detail', 'card detail reader', 'duży czytnik szczegółów karty']
  ];

  const root = document.getElementById('wireframeRoot');
  const cockpit = document.getElementById('cockpitLayout');
  const mobileWorkspace = document.getElementById('mobileWorkspace');

  function card(label, cls = '') {
    return `<div class="card-slot ${cls}">${label}</div>`;
  }

  function prgWing() {
    return `<div class="prg-wing">
      <div class="prg-axis">${card('R1')}${card('ODB','odb')}</div>
      <div class="prg-axis">${card('R1')}${card('ODB','odb')}</div>
      <div class="prg-axis">${card('R1')}${card('ODB','odb')}</div>
      <div class="prg-axis">${card('R1')}${card('ODB','odb')}</div>
      <div class="r2-column">${card('R2','r2')}${card('R2','r2')}${card('R2','r2')}</div>
    </div>`;
  }

  function worldWing() {
    return `<div class="world-wing">
      <div class="world-axis">${card('R1')}${card('R1')}${card('EXT','ext')} ${card('R2','r2')}</div>
      <div class="world-axis">${card('R1')}${card('R1')}${card('EXT','ext')} ${card('R2','r2')}</div>
      <div class="world-axis">${card('R1')}${card('R1')}${card('EXT','ext')} ${card('R2','r2')}</div>
      <div class="world-axis">${card('R1')}${card('R1')}${card('EXT','ext')} ${card('R2','r2')}</div>
    </div>`;
  }

  function coreMarkup() {
    return `<div class="core-wrap">
      <div class="connector left"></div><div class="connector right"></div>
      <div class="future-node n1">unlockable node</div>
      <div class="future-node n2">mini connector</div>
      <div class="future-node n3">future resource node</div>
      <div class="core-shell"><div class="r4-seat">${card('R4','r4')}</div></div>
      <div class="r3-left">${card('R3','r3')}</div>
      <div class="r3-right">${card('R3','r3')}</div>
      <div class="ds-module">${card('DS','ds')}</div>
    </div>`;
  }

  function zoneBody(id) {
    if (id === 'middle_left_prg') return prgWing();
    if (id === 'middle_right_world') return worldWing();
    if (id === 'middle_center_resonance_core') return `<div class="core-zone">${coreMarkup()}</div>`;
    if (id === 'bottom_left_inventory') return `<div class="cards-bank">${Array.from({ length: 20 }).map((_, i) => card(`INV-${i+1}`)).join('')}</div>`;
    if (id === 'bottom_center_forge') return `<div class="forge-portal">mini portal<br>Kuźnia</div>`;
    if (id === 'bottom_right_card_detail') return '<div class="detail-lines">Card Name<br>Type / Axis / Tier<br>Effect text preview<br>Haiku preview</div>';
    return '';
  }

  zones.forEach(([id, role, info]) => {
    const el = document.createElement('article');
    el.className = `zone zone-${id}`;
    el.innerHTML = `<h3>${id}</h3><div class="meta">${role} · ${info}</div>${zoneBody(id)}`;
    cockpit.appendChild(el);
  });

  function renderMobile(selected) {
    const tabs = ['CORE', 'PRG', 'ŚWIAT', 'INVENTORY', 'FORGE', 'DETAIL'];
    mobileWorkspace.innerHTML = `<h2>Mobile concept — core + workspace selector</h2>
      <p>Top band + resonance core always visible; selected workspace below.</p>
      <div class="workspace-tabs">${tabs.map((t) => `<button data-tab="${t}" ${selected === t ? 'aria-current="true"' : ''}>${t}</button>`).join('')}</div>
      <div class="workspace-panel"><strong>${selected}</strong><br>${selected === 'CORE' ? 'R4 center + R3 sides + DS module + connectors' : 'Repo-only content workspace preview (non-runtime)'}</div>`;
    mobileWorkspace.querySelectorAll('button').forEach((btn) => btn.addEventListener('click', () => renderMobile(btn.dataset.tab)));
  }
  renderMobile('CORE');

  document.querySelectorAll('[data-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-mode]').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      root.className = `mode-${btn.dataset.mode}`;
    });
  });
})();
