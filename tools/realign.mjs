// Acomoda los espacios que ya existen a las normas actuales del piso (después de un cambio de
// plano). Lee el piso como lo da /api/building y escribe el SQL para correr en Supabase.
//   node tools/realign.mjs building.json > realign.sql
// Cada oficina queda en el lugar válido más cercano a donde estaba, en su misma fila y con
// su mismo ancho (las publicadas primero). Si no cabe en ninguna parte, se avisa y no se toca.
import fs from 'node:fs';
import R from '../public/js/rules.js';

const floor = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const offices = floor.spaces.filter((s) => s.kind === 'office')
  .sort((a, b) => (a.status === b.status ? 0 : a.status === 'published' ? -1 : 1));
const placed = [], sql = [], notes = [];
for (const s of offices) {
  // los anchos de antes que no se venden hoy se respetan para esta oficina
  if (!R.WIDTHS.includes(s.w)) R.WIDTHS.push(s.w);
  const rows = [s.row].concat(R.ROWS.map((r) => r.id).filter((r) => r !== s.row));
  let to = null;
  for (const row of rows) {
    const ok = R.starts(placed, row, s.w);
    if (!ok.length) continue;
    to = { row, a: ok.reduce((b, x) => (Math.abs(x - s.x) < Math.abs(b - s.x) ? x : b), ok[0]) };
    break;
  }
  if (!to) { notes.push(`-- ${s.id} (${s.row} ${s.x}, ${s.w} m): no cabe; queda como está`); continue; }
  placed.push({ id: s.id, row: to.row, a: to.a, w: s.w });
  if (to.row !== s.row || to.a !== s.x)
    sql.push(`update public.spaces set "row" = '${to.row}', x = ${to.a}, doc = doc || '{"row":"${to.row}","x":${to.a}}'::jsonb where id = '${s.id}'; -- antes ${s.row} ${s.x}`);
}
console.log(notes.concat(sql, sql.length ? ['update public.floors set version = version + 1;'] : ['-- nada que mover']).join('\n'));
