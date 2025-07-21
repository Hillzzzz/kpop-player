// src/hooks/useSongs.ts
import useSWR, { mutate } from 'swr';

/* ---------- constants ---------- */
export const PAGE_SIZE = 20;
export const API =
  // value injected at build time on Netlify / Vercel
  import.meta.env.VITE_API_URL ??
  // fallback for local dev
  'http://localhost:4000';

/* ---------- fetcher ---------- */
const fetcher = (url: string) => fetch(url).then((r) => r.json());

/* ---------- hook ---------- */
export default function useSongs(page = 0) {
  const url = `${API}/songs?skip=${page * PAGE_SIZE}&take=${PAGE_SIZE}`;
  return useSWR(url, fetcher);
}

/* ---------- helpers ---------- */

// Revalidate every /songs page in the SWR cache
export const refreshAllSongs = () =>
  mutate((key: unknown) =>
    typeof key === 'string' && key.startsWith(`${API}/songs`)
  );

// Shorthand used by components
export const revalidateSongs = refreshAllSongs;
