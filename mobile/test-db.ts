import { getEvents } from './utils/supabase/events.service';

async function test() {
  try {
    const events = await getEvents();
    console.log('Sample Event:', JSON.stringify(events[0], null, 2));
  } catch (e) {
    console.error(e);
  }
}

test();
