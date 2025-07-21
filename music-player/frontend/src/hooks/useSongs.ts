import useSWR, { mutate } from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const PAGE_SIZE = 20;
export const API = import.meta.env.VITE_API_URL;

export default function useSongs(page = 0) {
  return useSWR(`${API}/songs?skip=${page * PAGE_SIZE}&take=${PAGE_SIZE}`, fetcher);
}

// Global refresh for all pages
export const refreshAllSongs = () => mutate((key: string) => key.startsWith(`${API}/songs`));

// Force revalidation of all SWR caches
export const revalidateSongs = () => mutate(() => true);

