import { revalidateSongs } from '../hooks/useSongs'; // update your import
import { usePlayer } from '../hooks/usePlayer'; // if you're using a player hook/context

const save = async () => {
  // If audioUrl is a File, upload it first
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

    // Update the form with the real URL
    form.audioUrl = audioUrl;
  }

  // Save the song (either create or update)
  const method = initial ? 'PUT' : 'POST';
  const url = initial ? `${API}/songs/${initial.id}` : `${API}/songs`;

  await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form),
  });

  revalidateSongs();
  onClose();
  setCurrent?.(0); // optional, depends on your player setup
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

