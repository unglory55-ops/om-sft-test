(function () {
  const canvas = document.getElementById('canvas');
  const svg = document.getElementById('wires');

  // Подгоняем SVG под canvas
  function sizeSvg() {
    const w = canvas.clientWidth,
      h = canvas.clientHeight;
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  }

  // Геометрия сторон центра блока в координатах canvas
  function sideCenters(el, baseRect) {
    const r = el.getBoundingClientRect();
    const cx = r.left - baseRect.left + r.width / 2;
    const cy = r.top - baseRect.top + r.height / 2;
    return {
      rect: r,
      left: { x: r.left - baseRect.left, y: cy },
      right: { x: r.right - baseRect.left, y: cy },
      top: { x: cx, y: r.top - baseRect.top },
      bottom: { x: cx, y: r.bottom - baseRect.top },
      center: { x: cx, y: cy },
    };
  }

  // Ортогональный маршрут H-V-H или V-H-V
  function orthPath(aPt, bPt) {
    const dx = bPt.x - aPt.x;
    const dy = bPt.y - aPt.y;

    // Если «шире», делаем H-V-H через середину по X
    if (Math.abs(dx) >= Math.abs(dy)) {
      const midX = aPt.x + dx / 2;
      return `M ${aPt.x} ${aPt.y} H ${midX} V ${bPt.y} H ${bPt.x}`;
    }
    // Иначе V-H-V через середину по Y
    const midY = aPt.y + dy / 2;
    return `M ${aPt.x} ${aPt.y} V ${midY} H ${bPt.x} V ${bPt.y}`;
  }

  // Соединить два блока: автоматический выбор сторон так,
  // чтобы заходить сбоку при горизонтальном сценарии и сверху/снизу при вертикальном.
  function connect(aEl, bEl, opts = {}) {
    const base = canvas.getBoundingClientRect();
    const A = sideCenters(aEl, base);
    const B = sideCenters(bEl, base);

    // Определяем, какие стороны брать
    const dx = B.center.x - A.center.x;
    const dy = B.center.y - A.center.y;

    let start, end;

    if (Math.abs(dx) >= Math.abs(dy)) {
      // Горизонтальная логика: стыкуем бок в бок
      start = dx >= 0 ? A.right : A.left;
      end = dx >= 0 ? B.left : B.right;
    } else {
      // Вертикальная логика: стыкуем верх/низ
      start = dy >= 0 ? A.bottom : A.top;
      end = dy >= 0 ? B.top : B.bottom;
    }

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', 'wire');
    path.setAttribute('d', orthPath(start, end));
    if (opts.arrowTo === 'end') {
      path.setAttribute('marker-end', 'url(#arrow)');
    } else if (opts.arrowTo === 'start') {
      path.setAttribute('marker-start', 'url(#arrow)');
    }
    svg.appendChild(path);
    return path;
  }

  function render() {
    sizeSvg();
    // очищаем предыдущие линии
    svg.querySelectorAll('.wire').forEach((n) => n.remove());

    const nA = document.getElementById('nA');
    const nB = document.getElementById('nB');
    const nC = document.getElementById('nC');

    // Примеры соединений
    connect(nB, nA, { arrowTo: 'end' }); // Ду Хаст -> Алликсаар (стрелка к Алликсаару)
    connect(nB, nC, { arrowTo: 'end' }); // Ду Хаст -> Анастасия (вертикальная ветка)
  }

  // Перерисовка при изменении размеров/контента
  const ro = new ResizeObserver(render);
  ro.observe(canvas);
  document.querySelectorAll('.node').forEach((n) => ro.observe(n));
  window.addEventListener('resize', render);

  render();
})();
