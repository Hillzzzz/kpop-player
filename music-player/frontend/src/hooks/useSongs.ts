import useSWR, { mutate } from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export const PAGE_SIZE = 20;
export const API = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

/* ------------- Hook ------------- */
export default function useSongs(page = 0) {
  const url = `${API}/songs?skip=${page * PAGE_SIZE}&take=${PAGE_SIZE}`;
  return useSWR(url, fetcher);
}

/* ------------- Helpers ------------- */

// refresh only the /songs pages
export const refreshAllSongs = () =>
  mutate((key: any) => typeof key === 'string' && key.startsWith(`${API}/songs`));

// alias for convenience
export const revalidateSongs = refreshAllSongs;
