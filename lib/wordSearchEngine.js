const DIRECTIONS = [
  { dr: 0, dc: 1 },
  { dr: 0, dc: -1 },
  { dr: 1, dc: 0 },
  { dr: -1, dc: 0 },
  { dr: 1, dc: 1 },
  { dr: 1, dc: -1 },
  { dr: -1, dc: 1 },
  { dr: -1, dc: -1 },
];

export function buildWordSearchGrid(words, rows, cols) {
  const grid = Array.from({ length: rows }, () => new Array(cols).fill(null));
  let pool = [];
  words.forEach((w) => w.units.forEach((u) => { if (!pool.includes(u)) pool.push(u); }));
  if (pool.length === 0) pool = ["æ", "b", "d", "ɪ", "p", "s", "t"];

  words.forEach((w) => {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 300) {
      attempts++;
      const d = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);
      if (canPlace(grid, w.units, r, c, d, rows, cols)) {
        for (let i = 0; i < w.units.length; i++) {
          grid[r + d.dr * i][c + d.dc * i] = w.units[i];
        }
        placed = true;
      }
    }
  });

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!grid[r][c]) grid[r][c] = pool[Math.floor(Math.random() * pool.length)];
    }
  }

  return grid;
}

function canPlace(grid, units, r, c, d, rows, cols) {
  const len = units.length;
  const endR = r + d.dr * (len - 1);
  const endC = c + d.dc * (len - 1);
  if (endR < 0 || endR >= rows || endC < 0 || endC >= cols) return false;
  for (let i = 0; i < len; i++) {
    const cr = r + d.dr * i;
    const cc = c + d.dc * i;
    if (grid[cr][cc] && grid[cr][cc] !== units[i]) return false;
  }
  return true;
}
