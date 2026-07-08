import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const toRelay = (row) => ({
  id: row.id,
  stationId: row.station_id,
  name: row.name || '',
  num: row.num || '',
  object: row.object || '',
  manzil: row.manzil || '',
  stativ: row.stativ || '',
  lastCheck: row.last_check || '',
  nextCheck: row.next_check || '',
  note: row.note || '',
});

export const fromRelay = (relay) => ({
  station_id: relay.stationId,
  name: relay.name,
  num: relay.num,
  object: relay.object || null,
  manzil: relay.manzil || null,
  stativ: relay.stativ || null,
  last_check: relay.lastCheck || null,
  next_check: relay.nextCheck || null,
  note: relay.note || null,
});
