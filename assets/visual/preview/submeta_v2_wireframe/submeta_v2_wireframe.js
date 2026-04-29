(function () {
  const zones = [
    ['top_left_status', 'status / RP', 'top-band micro telemetry', ['submeta.overlay.top.left.center']],
    ['top_center_identity', 'SUB-META identity', 'panel identity + mode', ['submeta.overlay.top.center.center']],
    ['top_right_navigation', 'navigation', 'back + workspace mode', ['submeta.overlay.top.right.center']],
    ['middle_left_prg', 'PRG wing', '4 axes x (R1 + ODB), 3xR2 inner side', ['submeta.prg.center']],
    ['middle_center_resonance_core', 'resonance core', 'R4 center + 2xR3 orbiters', ['submeta.core.center', 'submeta.core.r4.center']],
    ['middle_right_world', 'ŚWIAT wing', '4 axes x (R1 + R1 + EXT), 3xR2 inner side', ['submeta.world.center']],
    ['bottom_left_inventory', 'inventory bank', 'wide reserve + DS in resources', ['submeta.inventory.center', 'submeta.inventory.ds.row.center']],
    ['bottom_center_forge', 'Kuźnia', '3:1 vertical card refinement rack', ['submeta.forge.center']],
    ['bottom_right_card_detail', 'card detail reader', 'large card inspector + haiku area', ['submeta.detail.center', 'submeta.detail.cardPreview.center', 'submeta.detail.textBlock.center']]
  ];

  const SUBMETA_LAYOUT_TOKENS_V07 = {
    version: '0.7',
    space: 'root-normalized',
    anchors: ['submeta.root.center','submeta.prg.center','submeta.world.center','submeta.core.center','submeta.inventory.center','submeta.forge.center','submeta.detail.center','submeta.prg.axis.size.center','submeta.prg.axis.glue.center','submeta.prg.axis.speed.center','submeta.prg.axis.objects.center','submeta.prg.bridge.01.center','submeta.prg.bridge.02.center','submeta.prg.bridge.03.center','submeta.world.axis.form.center','submeta.world.axis.intent.center','submeta.world.axis.time.center','submeta.world.axis.silence.center','submeta.world.bridge.01.center','submeta.world.bridge.02.center','submeta.world.bridge.03.center','submeta.core.r4.center','submeta.core.r3.left.center','submeta.core.r3.right.center','submeta.inventory.ds.center','submeta.detail.cardPreview.center','submeta.detail.metadata.center','submeta.detail.haiku.center'],
    nodes: [
      { id: 'submeta.root', center: { x: 0.5, y: 0.5 }, size: { w: 1.0, h: 1.0 }, rects: {}, parentId: null },
      { id: 'submeta.prg', parentId: 'submeta.root', anchorId: 'submeta.prg.center', center: { x: 0.2, y: 0.42 }, size: { w: 0.25, h: 0.44 } },
      { id: 'submeta.world', parentId: 'submeta.root', anchorId: 'submeta.world.center', center: { x: 0.8, y: 0.42 }, size: { w: 0.25, h: 0.44 } },
      { id: 'submeta.core', parentId: 'submeta.root', anchorId: 'submeta.core.center', center: { x: 0.5, y: 0.44 }, size: { w: 0.16, h: 0.30 } },
      { id: 'submeta.core.r4', parentId: 'submeta.core', anchorId: 'submeta.core.r4.center', center: { x: 0.5, y: 0.44 }, size: { w: 0.07, h: 0.20 } },
      { id: 'submeta.core.r3.left', parentId: 'submeta.core', anchorId: 'submeta.core.r3.left.center', center: { x: 0.44, y: 0.44 }, size: { w: 0.06, h: 0.16 } },
      { id: 'submeta.core.r3.right', parentId: 'submeta.core', anchorId: 'submeta.core.r3.right.center', center: { x: 0.56, y: 0.44 }, size: { w: 0.06, h: 0.16 } },
      { id: 'submeta.inventory', parentId: 'submeta.root', anchorId: 'submeta.inventory.center', center: { x: 0.28, y: 0.78 }, size: { w: 0.45, h: 0.18 } },
      { id: 'submeta.inventory.ds', parentId: 'submeta.inventory', anchorId: 'submeta.inventory.ds.center', center: { x: 0.2, y: 0.78 }, size: { w: 0.04, h: 0.13 } },
      { id: 'submeta.forge', parentId: 'submeta.root', anchorId: 'submeta.forge.center', center: { x: 0.53, y: 0.78 }, size: { w: 0.12, h: 0.18 } },
      { id: 'submeta.detail', parentId: 'submeta.root', anchorId: 'submeta.detail.center', center: { x: 0.78, y: 0.78 }, size: { w: 0.26, h: 0.20 } },
      { id: 'submeta.detail.cardPreview', parentId: 'submeta.detail', anchorId: 'submeta.detail.cardPreview.center', center: { x: 0.72, y: 0.78 }, size: { w: 0.06, h: 0.16 } },
      { id: 'submeta.detail.metadata', parentId: 'submeta.detail', anchorId: 'submeta.detail.metadata.center', center: { x: 0.81, y: 0.75 }, size: { w: 0.14, h: 0.08 } },
      { id: 'submeta.detail.haiku', parentId: 'submeta.detail', anchorId: 'submeta.detail.haiku.center', center: { x: 0.81, y: 0.83 }, size: { w: 0.14, h: 0.08 } }
    ],
    groups: [
      { groupId: 'submeta.group.prg.axis', parentId: 'submeta.prg', anchorId: 'submeta.prg.center', defaultOrientation: 'vertical', childOrder: ['size', 'glue', 'speed', 'objects'], cardAspectPolicy: 'vertical-ratio-lock', minGap: 0.01, scalePolicy: 'uniform-with-gap-compression' },
      { groupId: 'submeta.group.prg.bridge', parentId: 'submeta.prg', anchorId: 'submeta.prg.bridge.02.center', defaultOrientation: 'vertical', childOrder: ['01', '02', '03'], cardAspectPolicy: 'vertical-ratio-lock', minGap: 0.012, scalePolicy: 'uniform' },
      { groupId: 'submeta.group.world.axis', parentId: 'submeta.world', anchorId: 'submeta.world.center', defaultOrientation: 'horizontal', childOrder: ['form', 'intent', 'time', 'silence'], cardAspectPolicy: 'vertical-ratio-lock', minGap: 0.01, scalePolicy: 'uniform-with-gap-compression' },
      { groupId: 'submeta.group.world.bridge', parentId: 'submeta.world', anchorId: 'submeta.world.bridge.02.center', defaultOrientation: 'vertical', childOrder: ['01', '02', '03'], cardAspectPolicy: 'vertical-ratio-lock', minGap: 0.012, scalePolicy: 'uniform' },
      { groupId: 'submeta.group.core', parentId: 'submeta.core', anchorId: 'submeta.core.center', defaultOrientation: 'radial', childOrder: ['r4', 'r3.left', 'r3.right'], cardAspectPolicy: 'tier-aware', minGap: 0.008, scalePolicy: 'center-priority' },
      { groupId: 'submeta.group.inventory', parentId: 'submeta.inventory', anchorId: 'submeta.inventory.center', defaultOrientation: 'horizontal', childOrder: ['bank', 'ds'], cardAspectPolicy: 'mixed-bank', minGap: 0.006, scalePolicy: 'row-compression' },
      { groupId: 'submeta.group.forge', parentId: 'submeta.forge', anchorId: 'submeta.forge.center', defaultOrientation: 'vertical', childOrder: ['r1', 'sdr1', 'pdr1'], cardAspectPolicy: 'vertical-ratio-lock', minGap: 0.01, scalePolicy: 'stack-compression' },
      { groupId: 'submeta.group.detail', parentId: 'submeta.detail', anchorId: 'submeta.detail.center', defaultOrientation: 'split', childOrder: ['cardPreview', 'glyph', 'metadata', 'haiku'], cardAspectPolicy: 'reader-priority', minGap: 0.01, scalePolicy: 'content-priority' }
    ],
    connectors: [
      { connectorId: 'submeta.connector.prg.bridge.01', fromAnchor: 'submeta.prg.axis.size.center', toAnchor: 'submeta.prg.bridge.01.center', kind: 'semantic', layer: 'connector', avoidsInteractiveRects: true, preferredPath: 'arc', state: 'available' },
      { connectorId: 'submeta.connector.prg.bridge.02', fromAnchor: 'submeta.prg.axis.glue.center', toAnchor: 'submeta.prg.bridge.02.center', kind: 'semantic', layer: 'connector', avoidsInteractiveRects: true, preferredPath: 'arc', state: 'available' },
      { connectorId: 'submeta.connector.prg.bridge.03', fromAnchor: 'submeta.prg.axis.speed.center', toAnchor: 'submeta.prg.bridge.03.center', kind: 'semantic', layer: 'connector', avoidsInteractiveRects: true, preferredPath: 'arc', state: 'inactive' },
      { connectorId: 'submeta.connector.world.bridge.01', fromAnchor: 'submeta.world.axis.form.center', toAnchor: 'submeta.world.bridge.01.center', kind: 'semantic', layer: 'connector', avoidsInteractiveRects: true, preferredPath: 'arc', state: 'available' },
      { connectorId: 'submeta.connector.world.bridge.02', fromAnchor: 'submeta.world.axis.intent.center', toAnchor: 'submeta.world.bridge.02.center', kind: 'semantic', layer: 'connector', avoidsInteractiveRects: true, preferredPath: 'arc', state: 'available' },
      { connectorId: 'submeta.connector.world.bridge.03', fromAnchor: 'submeta.world.axis.time.center', toAnchor: 'submeta.world.bridge.03.center', kind: 'semantic', layer: 'connector', avoidsInteractiveRects: true, preferredPath: 'arc', state: 'inactive' },
      { connectorId: 'submeta.connector.prg.core', fromAnchor: 'submeta.prg.center', toAnchor: 'submeta.core.center', kind: 'semantic', layer: 'connector', avoidsInteractiveRects: true, preferredPath: 'bezier', state: 'active' },
      { connectorId: 'submeta.connector.world.core', fromAnchor: 'submeta.world.center', toAnchor: 'submeta.core.center', kind: 'semantic', layer: 'connector', avoidsInteractiveRects: true, preferredPath: 'bezier', state: 'active' },
      { connectorId: 'submeta.connector.core.inventory', fromAnchor: 'submeta.core.center', toAnchor: 'submeta.inventory.center', kind: 'semantic', layer: 'connector', avoidsInteractiveRects: true, preferredPath: 'line', state: 'available' },
      { connectorId: 'submeta.connector.inventory.detail', fromAnchor: 'submeta.inventory.center', toAnchor: 'submeta.detail.center', kind: 'semantic', layer: 'connector', avoidsInteractiveRects: true, preferredPath: 'line', state: 'available' },
      { connectorId: 'submeta.connector.forge.inventory', fromAnchor: 'submeta.forge.center', toAnchor: 'submeta.inventory.center', kind: 'semantic', layer: 'connector', avoidsInteractiveRects: true, preferredPath: 'line', state: 'available' }
    ]
  };

  function rectFromCenter(node, scale = 1) {
    const w = node.size.w * scale;
    const h = node.size.h * scale;
    return { center: node.center, size: { w, h } };
  }

  SUBMETA_LAYOUT_TOKENS_V07.nodes = SUBMETA_LAYOUT_TOKENS_V07.nodes.map((node) => {
    if (!node.center || !node.size) return node;
    const isRoot = node.id === "submeta.root";
    return {
      ...node,
      rects: {
        layoutRect: rectFromCenter(node, 1.0),
        interactiveRect: rectFromCenter(node, 0.92),
        visualMountRect: rectFromCenter(node, isRoot ? 1.0 : 1.05),
        visualBleedRect: rectFromCenter(node, isRoot ? 1.0 : 1.12),
        contentSafeRect: rectFromCenter(node, 0.84)
      },
      visualBleed: { x: 0.01, y: 0.01 }
    };
  });

  function validateSubmetaLayoutTokens(tokens) {
    const errors = [];
    const ids = new Set(tokens.nodes.map((n) => n.id));
    const anchors = new Set(tokens.anchors);
    const inRange = (v) => typeof v === 'number' && v >= 0 && v <= 1;
    tokens.nodes.forEach((node) => {
      if (!node.id) errors.push('node_without_id');
      if (!node.anchorId && !node.center) errors.push(`node_without_anchor_or_center:${node.id}`);
      if (node.parentId && !ids.has(node.parentId)) errors.push(`missing_parent:${node.id}->${node.parentId}`);
      if (node.center && (!inRange(node.center.x) || !inRange(node.center.y))) errors.push(`center_out_of_range:${node.id}`);
      if (node.size && (!inRange(node.size.w) || !inRange(node.size.h))) errors.push(`size_out_of_range:${node.id}`);
      if (node.rects) {
        Object.values(node.rects).forEach((rect) => {
          if (!rect || !rect.center || !rect.size) errors.push(`invalid_rect:${node.id}`);
          else if (![rect.center.x, rect.center.y, rect.size.w, rect.size.h].every(inRange)) errors.push(`rect_out_of_range:${node.id}`);
        });
      }
    });
    tokens.connectors.forEach((c) => {
      if (!anchors.has(c.fromAnchor)) errors.push(`missing_from_anchor:${c.connectorId}`);
      if (!anchors.has(c.toAnchor)) errors.push(`missing_to_anchor:${c.connectorId}`);
    });
    return { valid: errors.length === 0, errors };
  }

  const validation = validateSubmetaLayoutTokens(SUBMETA_LAYOUT_TOKENS_V07);
  if (!validation.valid) console.warn('SUBMETA_LAYOUT_TOKENS_V07 validation errors', validation.errors);
  else console.info('SUBMETA_LAYOUT_TOKENS_V07 validation ok');

  if (typeof document === 'undefined' || typeof document.createElement !== 'function') return;

  const root = document.getElementById('wireframeRoot');
  const cockpit = document.getElementById('cockpitLayout');
  const mobileWorkspace = document.getElementById('mobileWorkspace');
  const card = (label, cls = '') => `<div class="card-slot ${cls}">${label}</div>`;
  const prgWing = () => `<div class="prg-wing">${Array.from({ length: 4 }).map(() => `<div class="prg-axis">${card('R1')}${card('ODB', 'odb')}</div>`).join('')}<div class="r2-column">${card('R2', 'r2')}${card('R2', 'r2')}${card('R2', 'r2')}</div></div>`;
  const worldWing = () => `<div class="world-wing">${Array.from({ length: 4 }).map(() => `<div class="world-axis">${card('R1')}${card('R1')}${card('EXT', 'ext')}${card('R2', 'r2')}</div>`).join('')}</div>`;
  const coreMarkup = () => `<div class="core-wrap"><div class="connector left"></div><div class="connector right"></div><div class="future-node n1">unlockable node</div><div class="future-node n2">mini connector</div><div class="future-node n3">future node</div><div class="core-shell"><div class="r4-seat">${card('R4', 'r4')}</div></div><div class="r3-left">${card('R3', 'r3')}</div><div class="r3-right">${card('R3', 'r3')}</div></div>`;
  const rectLayer = () => `<div class="debug-rect-layer"><span class="debug-rect-layout">layout</span><span class="debug-rect-hit">interactive</span><span class="debug-rect-mount">mount</span><span class="debug-rect-bleed">bleed</span><span class="debug-rect-safe">safe</span></div>`;

  function zoneBody(id) {
    if (id === 'middle_left_prg') return prgWing();
    if (id === 'middle_right_world') return worldWing();
    if (id === 'middle_center_resonance_core') return `<div class="core-zone">${coreMarkup()}</div>`;
    if (id === 'bottom_left_inventory') return `<div class="cards-bank">${Array.from({ length: 23 }).map((_, i) => card(i === 2 ? 'DS' : `INV-${i + 1}`, 'slim')).join('')}</div>`;
    if (id === 'bottom_center_forge') return `<div class="forge-rack">${card('R1')}${card('sDR1')}${card('pDR1')}</div>`;
    if (id === 'bottom_right_card_detail') return `<div class="detail-reader"><div>${card('CARD')}<div class="glyph">✶</div></div><div class="detail-lines"><strong>Nazwa karty</strong><br>Typ / Tier / Axis<br>Opis efektu i relacja z rdzeniem.<br>Dodatkowe informacje: source, cost, resonance tags.<br><br><em>Haiku area:</em><br>Trzy wersy podglądu poetyckiego opisu.</div></div>`;
    return '';
  }

  zones.forEach(([id, role, info, anchors]) => {
    const el = document.createElement('article');
    el.className = `zone zone-${id}`;
    el.innerHTML = `<h3>${id}</h3><div class="meta">${role} · ${info}</div><div>${anchors.map((a) => `<span class="anchor-chip">${a}</span>`).join('')}</div><span class="debug-anchor-label">${anchors[0]}</span>${rectLayer()}${zoneBody(id)}`;
    cockpit.appendChild(el);
  });

  function renderMobile(selected) {
    const tabs = ['CORE', 'PRG', 'ŚWIAT', 'INVENTORY', 'FORGE', 'DETAIL'];
    mobileWorkspace.innerHTML = `<h2>Mobile concept — core + workspace selector</h2><p>Semantyczne 9 stref zachowane; na małym ekranie aktywny jest jeden workspace.</p><div class="workspace-tabs">${tabs.map((t) => `<button data-tab="${t}" ${selected === t ? 'aria-current="true"' : ''}>${t}</button>`).join('')}</div><div class="workspace-panel"><strong>${selected}</strong><br>Anchor-aware preview, bez runtime integration.</div>`;
    mobileWorkspace.querySelectorAll('button').forEach((btn) => btn.addEventListener('click', () => renderMobile(btn.dataset.tab)));
  }
  renderMobile('CORE');

  const debugToggle = document.getElementById('debugToggle');
  debugToggle.addEventListener('click', () => {
    root.classList.toggle('debug-off');
    const pressed = !root.classList.contains('debug-off');
    debugToggle.setAttribute('aria-pressed', String(pressed));
  });

  document.querySelectorAll('[data-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-mode]').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      root.className = `mode-${btn.dataset.mode}`;
    });
  });
})();
