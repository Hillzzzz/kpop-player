import ReactJkMusicPlayer from 'react-jinke-music-player';
import 'react-jinke-music-player/assets/index.css';

export interface Track {
  name: string;
  singer: string;
  cover: string;
  musicSrc: string;
}
interface Props {
  tracks: Track[];
  initialIndex: number;
}

export default function PlayerBar({ tracks, initialIndex }: Props) {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <ReactJkMusicPlayer
        quietUpdate
        audioLists={tracks}
        mode="mini"
        defaultPlayIndex={initialIndex}
        toggleMode                 /* allow expand */
        showThemeSwitch={false}
        glassBg={false}
        remove={false}
        drag={false}
        autoHiddenCover
      />
    </div>
  );
}

 |
| **3. Wire everything together in App.tsx** | Overwrite the file so clicks play songs, cover art updates, add/edit/delete refresh instantly. | 

tsx
import { useState, useEffect } from 'react';
import useSongs, { PAGE_SIZE, refreshAllSongs, API } from './hooks/useSongs';
import SongModal, { Song } from './components/SongModal';
import { useInView } from 'react-intersection-observer';
import PlayerBar, { Track } from './components/PlayerBar';
import Header from './components/Header';
import './index.css';

export default function App() {
  /* paging */
  const [page, setPage] = useState(0);
  const { data = [] } = useSongs(page);
  const [songs, setSongs] = useState<Song[]>([]);
  useEffect(() => setSongs((p) => [...p, ...data]), [data]);

  /* infinite scroll sentinel */
  const { ref, inView } = useInView();
  useEffect(() => { if (inView) setPage((p) => p + 1); }, [inView]);

  /* modal state */
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Song | null>(null);

  /* player */
  const [current, setCurrent] = useState<number>(0);
  const tracks: Track[] = songs.map((s) => ({
    name: s.title,
    singer: s.artist,
    cover: s.coverUrl || 'https://placehold.co/400x400?text=No+Cover',
    musicSrc: s.audioUrl,
  }));

  /* helpers */
  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (s: Song) => { setEditing(s); setModalOpen(true); };
  const del = async (id: number) => {
    await fetch(`${API}/songs/${id}`, { method: 'DELETE' });
    refreshAllSongs();
    setSongs((p) => p.filter((s) => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-kpop-50 text-kpop-900 pb-40">
      <div className="max-w-screen-sm mx-auto p-4 space-y-6">
        <Header />

        {/* Recently played cover */}
        <section className="grid grid-cols-2 gap-4">
          <div className="rounded-3xl overflow-hidden shadow-lg">
            <img src={tracks[current]?.cover} alt="cover" className="w-full aspect-square object-cover" />
            <p className="p-2 text-center font-semibold">{tracks[current]?.name || '—'}</p>
          </div>

          {/* K‑POP / Favorites buttons (placeholder) */}
          <div className="flex flex-col gap-4 justify-center">
            {['K‑POP', 'Favorites'].map((t) => (
              <button key={t} className="rounded-2xl py-4 font-bold bg-kpop-200 hover:bg-kpop-300">
                {t}
              </button>
            ))}
          </div>
        </section>

        {/* Hot tracks list */}
        <h2 className="text-lg font-bold">Hot tracks</h2>
        <ul className="space-y-3">
          {songs.map((s, idx) => (
            <li key={s.id} className="flex justify-between items-center bg-kpop-100 hover:bg-kpop-200 transition rounded-2xl px-4 py-3 shadow-sm cursor-pointer"
                onClick={() => setCurrent(idx)}>
              <div>
                <p className="font-semibold text-kpop-800">{s.title}</p>
                <span className="text-sm text-kpop-700 opacity-80">{s.artist}</span>
              </div>
              <div className="flex gap-3">
                <button onClick={(e) => { e.stopPropagation(); openEdit(s); }} className="text-kpop-600">✏️</button>
                <button onClick={(e) => { e.stopPropagation(); del(s.id!); }} className="text-red-600">🗑️</button>
              </div>
            </li>
          ))}
        </ul>

        <div ref={ref} className="h-8" />
      </div>

      {/* floating add button */}
      <button onClick={openAdd}
        className="fixed bottom-24 right-4 bg-kpop-500 text-white w-14 h-14 rounded-full text-3xl flex items-center justify-center shadow-lg">
        ＋
      </button>

      {/* modal */}
      <SongModal open={modalOpen} onClose={() => setModalOpen(false)} initial={editing} />

      {/* player */}
      <PlayerBar tracks={tracks} initialIndex={current} />
    </div>
  );
}
