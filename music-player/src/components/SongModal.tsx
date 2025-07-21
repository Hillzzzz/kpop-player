import { useState } from 'react';
import type { Song } from './SongModal.types'; // Adjust if needed
import { API } from '../lib/constants'; // Adjust if needed
import { revalidateSongs } from '../hooks/useSongs';

type Props = {
  open: boolean;
  onClose: () => void;
  initial: Song | null;
  setCurrent?: (i: number) => void;
};

export default function SongModal({ open, onClose, initial, setCurrent }: Props) {
  const [form, setForm] = useState<Song>(
    initial || { title: '', artist: '', audioUrl: '', coverUrl: '' }
  );

  const save = async () => {
    if (form.audioUrl instanceof File) {
      const fd = new FormData();
      fd.append('audio', form.audioUrl);

      const res = await fetch(`${API}/songs/upload`, {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) {
        alert('Audio upload failed');
        return;
      }

      const { audioUrl } = await res.json();
      form.audioUrl = audioUrl;
    }

    const method = initial ? 'PUT' : 'POST';
    const url = initial ? `${API}/songs/${initial.id}` : `${API}/songs`;

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    revalidateSongs();
    onClose();
    setCurrent?.(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Title"
          className="w-full mb-3 p-2 border"
        />
        <input
          type="text"
          value={form.artist}
          onChange={(e) => setForm({ ...form, artist: e.target.value })}
          placeholder="Artist"
          className="w-full mb-3 p-2 border"
        />
        <input
          type="text"
          value={form.coverUrl}
          onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
          placeholder="Cover URL"
          className="w-full mb-3 p-2 border"
        />
        <input
          type="file"
          accept="audio/*"
          onChange={(e) =>
            setForm({ ...form, audioUrl: e.target.files?.[0] as any })
          }
          className="mb-4"
        />
        <div className="flex gap-4 justify-end">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={save}
            className="px-4 py-2 bg-kpop-500 hover:bg-kpop-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
