(function () {
  const zones = [
    ['top_left_status', 'status / RP', 'top-band micro telemetry', ['mountCenter','named:status.left']],
    ['top_center_identity', 'SUB-META identity', 'panel identity + mode', ['mountCenter','named:identity.center']],
    ['top_right_navigation', 'navigation', 'back + workspace mode', ['mountCenter','named:navigation.right']],
    ['middle_left_prg', 'PRG wing', '4 axes x (R1 + ODB), 3xR2 inner side', ['mountCenter','named:prg.wing.inner']],
    ['middle_center_resonance_core', 'resonance core', 'R4 center + 2xR3 orbiters', ['pivot:center','named:core.r4']],
    ['middle_right_world', 'ŚWIAT wing', '4 axes x (R1 + R1 + EXT), 3xR2 inner side', ['mountCenter','named:world.wing.inner']],
    ['bottom_left_inventory', 'inventory bank', 'wide reserve + DS in resources', ['named:inventory.bank']],
    ['bottom_center_forge', 'Kuźnia', '3:1 vertical card refinement rack', ['named:forge.input']],
    ['bottom_right_card_detail', 'card detail reader', 'large card inspector + haiku area', ['named:detail.card']] 
  ];

  const root = document.getElementById('wireframeRoot');
  const cockpit = document.getElementById('cockpitLayout');
  const mobileWorkspace = document.getElementById('mobileWorkspace');
  const card = (label, cls = '') => `<div class="card-slot ${cls}">${label}</div>`;

  const prgWing = () => `<div class="prg-wing">${Array.from({ length: 4 }).map(() => `<div class="prg-axis">${card('R1')}${card('ODB','odb')}</div>`).join('')}<div class="r2-column">${card('R2','r2')}${card('R2','r2')}${card('R2','r2')}</div></div>`;

  const worldWing = () => `<div class="world-wing">${Array.from({ length: 4 }).map(() => `<div class="world-axis">${card('R1')}${card('R1')}${card('EXT','ext')}${card('R2','r2')}</div>`).join('')}</div>`;

  const coreMarkup = () => `<div class="core-wrap"><div class="connector left"></div><div class="connector right"></div><div class="future-node n1">unlockable node</div><div class="future-node n2">mini connector</div><div class="future-node n3">future node</div><div class="core-shell"><div class="r4-seat">${card('R4','r4')}</div></div><div class="r3-left">${card('R3','r3')}</div><div class="r3-right">${card('R3','r3')}</div></div>`;

  function zoneBody(id) {
    if (id === 'middle_left_prg') return prgWing();
    if (id === 'middle_right_world') return worldWing();
    if (id === 'middle_center_resonance_core') return `<div class="core-zone">${coreMarkup()}</div>`;
    if (id === 'bottom_left_inventory') return `<div class="cards-bank">${Array.from({ length: 23 }).map((_, i) => card(i === 2 ? 'DS' : `INV-${i+1}`, 'slim')).join('')}</div>`;
    if (id === 'bottom_center_forge') return `<div class="forge-rack">${card('R1')}${card('sDR1')}${card('pDR1')}</div>`;
    if (id === 'bottom_right_card_detail') return `<div class="detail-reader"><div>${card('CARD')}<div class="glyph">✶</div></div><div class="detail-lines"><strong>Nazwa karty</strong><br>Typ / Tier / Axis<br>Opis efektu i relacja z rdzeniem.<br>Dodatkowe informacje: source, cost, resonance tags.<br><br><em>Haiku area:</em><br>Trzy wersy podglądu poetyckiego opisu.</div></div>`;
    return '';
  }

  zones.forEach(([id, role, info, anchors]) => {
    const el = document.createElement('article');
    el.className = `zone zone-${id}`;
    el.innerHTML = `<h3>${id}</h3><div class="meta">${role} · ${info}</div><div>${anchors.map((a) => `<span class="anchor-chip">${a}</span>`).join('')}</div>${zoneBody(id)}`;
    cockpit.appendChild(el);
  });

  function renderMobile(selected) {
    const tabs = ['CORE', 'PRG', 'ŚWIAT', 'INVENTORY', 'FORGE', 'DETAIL'];
    mobileWorkspace.innerHTML = `<h2>Mobile concept — core + workspace selector</h2><p>Semantyczne 9 stref zachowane; na małym ekranie aktywny jest jeden workspace.</p><div class="workspace-tabs">${tabs.map((t) => `<button data-tab="${t}" ${selected === t ? 'aria-current="true"' : ''}>${t}</button>`).join('')}</div><div class="workspace-panel"><strong>${selected}</strong><br>Anchor-aware preview, bez runtime integration.</div>`;
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
