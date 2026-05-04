import { Share } from 'react-native';

export type ShareKind = 'hotel' | 'experience' | 'flight' | 'trip';

const PATH_BUILDERS: Record<ShareKind, (id: string) => string> = {
  hotel: (id) => `/hotel/${encodeURIComponent(id)}`,
  experience: (id) => `/experience/${encodeURIComponent(id)}`,
  flight: (id) => `/flights/results?${id}`,
  trip: (id) => `/trip/${encodeURIComponent(id)}`,
};

const UNIVERSAL_HOST = 'https://app.runwae.io';

export type ShareEntityOptions = {
  kind: ShareKind;
  id: string;
  title: string;
  subtitle?: string;
  query?: Record<string, string | undefined>;
};

export async function shareEntity(opts: ShareEntityOptions) {
  const path = PATH_BUILDERS[opts.kind](opts.id);
  const search = opts.query
    ? Object.entries(opts.query)
        .filter((entry): entry is [string, string] => Boolean(entry[1]))
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&')
    : '';
  const url = search.length > 0 ? `${UNIVERSAL_HOST}${path}?${search}` : `${UNIVERSAL_HOST}${path}`;
  const message = opts.subtitle
    ? `${opts.title} — ${opts.subtitle}\n${url}`
    : `${opts.title}\n${url}`;
  return Share.share({ message, url, title: opts.title });
}
