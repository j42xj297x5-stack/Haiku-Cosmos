(function () {
  const zones = [
    ['top_left_status','status RP / alerts','RP, resonance status, lock hints'],
    ['top_center_identity','identity','SUB-META title, config glyph'],
    ['top_right_navigation','navigation','back, mode, safe actions'],
    ['middle_left_prg','PRG workspace','PRG slots and active branch'],
    ['middle_center_resonance_core','resonance core','R2 bridge, R3 reserve, R4 unity, DS module'],
    ['middle_right_world','WORLD workspace','world slots and branch state'],
    ['bottom_left_inventory','inventory','R1/R2/R3/R4 cards pool'],
    ['bottom_center_forge','forge','craft/upgrade operation panel'],
    ['bottom_right_card_detail','card detail','selected card preview and notes']
  ];

  const root = document.getElementById('wireframeRoot');
  const grid = document.getElementById('cockpitGrid');
  const mobileWorkspace = document.getElementById('mobileWorkspace');

  function zoneEl([id, role, sample]) {
    const el = document.createElement('article');
    el.className = 'zone';
    el.innerHTML = `<strong>${id}</strong><div class="meta">rola: ${role}<br>elementy: ${sample}<br>future hooks: named anchors / state layers</div>
      <div class="bleed-box"></div><div class="mount-box"></div><div class="interactive-box"></div><div class="pivot-dot"></div>
      <i class="anchor-dot a-top" title="anchor:top"></i><i class="anchor-dot a-right" title="anchor:right"></i><i class="anchor-dot a-bottom" title="anchor:bottom"></i><i class="anchor-dot a-left" title="anchor:left"></i>`;
    return el;
  }

  zones.forEach((z) => grid.appendChild(zoneEl(z)));

  function renderMobileWorkspace(selected) {
    const names = ['PRG', 'WORLD', 'INVENTORY', 'FORGE', 'DETAIL'];
    mobileWorkspace.innerHTML = `<h2>Mobile model 9 stref (logiczny)</h2>
      <p>Stałe: status + identity + nav, resonance core. Przełączane: workspace.</p>
      <div class="workspace-tabs">${names.map(n=>`<button data-ws="${n}" ${selected===n?'aria-current="true"':''}>${n}</button>`).join('')}</div>
      <div class="workspace-panel"><strong>Selected workspace:</strong> ${selected}</div>`;
    mobileWorkspace.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => renderMobileWorkspace(b.dataset.ws)));
  }
  renderMobileWorkspace('PRG');

  document.querySelectorAll('[data-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-mode]').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      root.className = `mode-${btn.dataset.mode}`;
    });
  });
})();
