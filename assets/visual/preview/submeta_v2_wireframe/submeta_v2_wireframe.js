(function () {
  const zones = [
    ['top_left_status', 'status / RP', 'micro status bar, low height'],
    ['top_center_identity', 'SUB-META identity', 'title + cockpit marker'],
    ['top_right_navigation', 'navigation', 'Wróć + view mode'],
    ['middle_left_prg', 'PRG wing', '4 osie (R1 + ODB/ext) + 3 R2'],
    ['middle_center_resonance_core', 'resonance core', 'R4 / R3 ring / R2 bridges / DS'],
    ['middle_right_world', 'ŚWIAT wing', '4 osie (2xR1 + ext) + 3 R2'],
    ['bottom_left_inventory', 'inventory bank', 'wider horizontal card drawer'],
    ['bottom_center_forge', 'mini Kuźnia portal', 'entry to deeper forge workspace'],
    ['bottom_right_card_detail', 'card detail reader', 'name/type/description/haiku']
  ];

  const root = document.getElementById('wireframeRoot');
  const cockpit = document.getElementById('cockpitLayout');
  const mobileWorkspace = document.getElementById('mobileWorkspace');

  function wingRows(type) {
    const rows = type === 'PRG'
      ? ['Axis I: R1 + ODB', 'Axis II: R1 + ODB', 'Axis III: R1 + ODB', 'Axis IV: R1 + ODB']
      : ['Axis I: R1 + R1 + EXT', 'Axis II: R1 + R1 + EXT', 'Axis III: R1 + R1 + EXT', 'Axis IV: R1 + R1 + EXT'];

    return `
      <div class="axis-row">${rows[0]} <span class="socket locked">locked node</span></div>
      <div class="axis-row">${rows[1]} <span class="socket">resource socket</span></div>
      <div class="axis-row">${rows[2]} <span class="socket locked">unlockable</span></div>
      <div class="axis-row">${rows[3]} <span class="socket">mini connector</span></div>
      <div class="socket-line">
        <span class="socket">R2-A</span><span class="socket">R2-B</span><span class="socket">R2-C</span><span class="socket locked">future unlock marker</span>
      </div>`;
  }

  function coreMarkup() {
    return `<div class="core-wrap">
      <div class="bridge-line left"></div><div class="bridge-line right"></div>
      <div class="unlock u1">mini connectors</div><div class="unlock u2">unlockable</div><div class="unlock u3">future UX layer</div>
      <div class="core-circle"><div class="r4-slot">R4</div></div>
      <div class="r3-ring">R3 stabilization ring</div>
      <div class="r2-node" style="top:16px;left:114px">R2</div>
      <div class="r2-node" style="top:58px;left:194px">R2</div>
      <div class="r2-node" style="top:166px;left:194px">R2</div>
      <div class="r2-node" style="top:208px;left:114px">R2</div>
      <div class="r2-node" style="top:166px;left:34px">R2</div>
      <div class="r2-node" style="top:58px;left:34px">R2</div>
      <div class="ds-module">DS module</div>
    </div>`;
  }

  function zoneBody(id) {
    if (id === 'middle_left_prg') return `<div class="wing">${wingRows('PRG')}</div>`;
    if (id === 'middle_right_world') return `<div class="wing">${wingRows('WORLD')}</div>`;
    if (id === 'middle_center_resonance_core') return `<div class="core-zone">${coreMarkup()}</div>`;
    if (id === 'bottom_left_inventory') return `<div class="cards-bank">${['R1','R1','R2','R1','R3','DS','R2','R1','R4','R1','R2','R1','R1','R3','R2','R1'].map((c) => `<div class="card">${c}</div>`).join('')}</div>`;
    if (id === 'bottom_center_forge') return `<div class="forge-portal">mini portal<br>Kuźnia</div>`;
    if (id === 'bottom_right_card_detail') return '<div class="detail-lines">Name: ---<br>Type: ---<br>Description: ---<br>Haiku preview: ---</div>';
    return '';
  }

  zones.forEach(([id, role, info]) => {
    const el = document.createElement('article');
    el.className = `zone zone-${id}`;
    if (id === 'middle_center_resonance_core') el.classList.add('core-zone-wrap');
    el.innerHTML = `<h3>${id}</h3><div class="meta">${role} · ${info}</div>${zoneBody(id)}`;
    if (id === 'middle_center_resonance_core') el.classList.add('core-zone');
    cockpit.appendChild(el);
  });

  function renderMobile(selected) {
    const tabs = ['CORE', 'PRG', 'ŚWIAT', 'INVENTORY', 'FORGE', 'DETAIL'];
    mobileWorkspace.innerHTML = `<h2>Mobile concept — core + workspace selector</h2>
      <p>Top band + resonance core always visible; selected workspace below.</p>
      <div class="workspace-tabs">${tabs.map((t) => `<button data-tab="${t}" ${selected === t ? 'aria-current="true"' : ''}>${t}</button>`).join('')}</div>
      <div class="workspace-panel"><strong>${selected}</strong><br>${selected === 'CORE' ? 'R4 / R3 / R2 / DS + connectors' : 'Koncepcyjny workspace preview (non-runtime)'}</div>`;
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
