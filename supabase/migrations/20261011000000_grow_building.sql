-- El edificio creció: una fila de oficinas arriba (fila A) y 25 columnas a la izquierda.
-- Las oficinas de la fila B que ya existían se corren 25 columnas a la derecha para quedar
-- donde estaban. Correr UNA sola vez, justo después de publicar el sitio con el edificio nuevo.
update public.spaces
  set x = x + 25, doc = jsonb_set(doc, '{x}', to_jsonb(x + 25))
  where kind = 'office' and "row" = 'B';
update public.floors set version = version + 1;
