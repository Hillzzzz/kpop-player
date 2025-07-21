// src/components/SongModal.tsx
import { useState, FormEvent } from 'react';
import { revalidateSongs } from '../hooks/useSongs';
import { API } from '../hooks/useSongs';

export interface Song {
  id?: number;
  title: string;
  artist: string;
  coverUrl?: string;
  audioUrl: string | File;
}

interface Props {
  open: boolean;
  onClose: () => void;
  initial: Song | null;
  refresh: () => void;
  setCurrent?: (i: number) => void;
}

export function SongModal({
  open,
  onClose,
  initial,
  refresh,
  setCurrent,
}: Props) {
  const [form, setForm] = useState<Song>(
    initial ?? { title: '', artist: '', audioUrl: '' as any }
  );

  if (!open) return null; // nothing rendered when closed

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await save(form, initial, onClose, setCurrent);
    refresh();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white text-black rounded-xl p-6 w-80 space-y-4"
      >
        <h2 className="text-xl font-bold">
          {initial ? 'Edit song' : 'Add a new song'}
        </h2>

        <input
          type="text"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="text"
          placeholder="Artist"
          value={form.artist}
          onChange={(e) => setForm({ ...form, artist: e.target.value })}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="file"
          accept="audio/*"
          onChange={(e) =>
            setForm({ ...form, audioUrl: e.target.files?.[0] as File })
          }
          className="w-full"
          required={!initial}
        />

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded bg-gray-300"
          >
            Cancel
          </button>
          <button type="submit" className="px-4 py-1 rounded bg-pink-600 text-white">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

// helper moved OUTSIDE the component so it's not recreated each render
async function save(
  form: Song,
  initial: Song | null,
  onClose: () => void,
  setCurrent?: (i: number) => void
) {
  try {
    // 1. upload audio file if needed
    if (form.audioUrl instanceof File) {
      const fd = new FormData();
      fd.append('audio', form.audioUrl);

      const res = await fetch(`${API}/songs/upload`, {
        method: 'POST',
        body: fd,
      });
      if (!res.ok) throw new Error('Audio upload failed');

      const { audioUrl } = await res.json();
      form.audioUrl = audioUrl;
    }

    // 2. save / update
    const method = initial ? 'PUT' : 'POST';
    const url = initial ? `${API}/songs/${initial.id}` : `${API}/songs`;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res.ok) throw new Error('Save failed');

    revalidateSongs();
    onClose();
    setCurrent?.(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    console.error(err);
    alert((err as Error).message);
  }
}

export default SongModal;
