import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import PlayerBar from './components/PlayerBar';
import './index.css';
import useSongs, { revalidateSongs } from './hooks/useSongs';
import SongModal from './components/SongModal';
import type { Song } from './components/SongModal';

export default function App() {
  const [pages, setPages] = useState<Song[][]>([]);
  const [offset, setOffset] = useState(0);
  const { ref, inView } = useInView();
  const { data: tracks = [] } = useSongs(offset);

  const [open, setOpen] = useState(false);
  const [editSong, setEditSong] = useState<Song | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (tracks.length || offset > 0) {
      setHasLoaded(true);
    }

    if (tracks.length) {
      setPages((prev) => [...prev, tracks]);
    }
  }, [tracks, offset]);

  useEffect(() => {
    if (inView) setOffset((prev) => prev + 20);
  }, [inView]);

  const allSongs = pages.flat();

  if (!hasLoaded) {
    return <p className="p-8 text-white bg-black min-h-screen">Loading...</p>;
  }

  if (hasLoaded && allSongs.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-3xl font-bold text-pink-400">No songs added yet</h1>
          <p className="text-lg">Please add songs to view them on your dashboard.</p>
          <p className="text-sm opacity-70">You can use the pink plus button in the bottom right to add songs through the UI.</p>
          <button
            onClick={() => setOpen(true)}
            className="mt-4 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg shadow-md"
          >
            Add Song Now
          </button>

          <SongModal open={open} onClose={() => setOpen(false)} initial={null} refresh={revalidateSongs} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-40 flex justify-center items-start pt-8">
      <div className="rounded-[2rem] p-10 w-full max-w-screen-md space-y-6 shadow-2xl border-4 border-pink-800 bg-[#ff00ff]">
        <h1 className="text-3xl font-serif text-white">Good Afternoon</h1>

        <section className="grid grid-cols-4 gap-4">
          <div className="col-span-3 md:col-span-2 rounded-3xl overflow-hidden shadow-lg">
            <img
              src={allSongs[0].coverUrl || '/default-cover.jpg'}
              alt="recent"
              className="w-full aspect-square object-cover"
            />
            <p className="p-2 text-center font-semibold">LOVE</p>
          </div>

          <div className="flex flex-col gap-4 justify-center col-span-1">
            {['K‑POP', 'Favorites'].map((t) => (
              <button
                key={t}
                className="rounded-2xl py-4 font-bold bg-pink-300 text-black hover:bg-pink-400"
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">Hot tracks</h2>
          <ul className="space-y-3">
            {allSongs.map((t) => (
              <li
                key={t.id}
                className="flex justify-between items-center bg-pink-300 text-black hover:bg-pink-400 transition rounded-2xl px-4 py-3 shadow-sm"
              >
                <div>
                  <p className="font-semibold">{t.title}</p>
                  <span className="text-sm opacity-80">{t.artist}</span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setEditSong(t); setOpen(true); }} className="text-black">✏️</button>
                  <button
                    onClick={async () => {
                      await fetch(`http://localhost:4000/songs/${t.id}`, { method: 'DELETE' });
                      revalidateSongs();
                    }}
                    className="text-black"
                  >🗑️</button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div ref={ref} className="h-8" />
      </div>

      <button
        onClick={() => { setEditSong(null); setOpen(true); }}
        className="fixed bottom-24 right-4 bg-pink-600 hover:bg-pink-700 text-white w-14 h-14 rounded-full text-3xl flex items-center justify-center shadow-lg"
      >＋</button>

      <SongModal open={open} onClose={() => setOpen(false)} initial={editSong} refresh={revalidateSongs} />

      <PlayerBar tracks={allSongs} />
    </div>
  );
}

