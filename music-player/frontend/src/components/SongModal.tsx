import { revalidateSongs } from '../hooks/useSongs';
import { API } from '../hooks/useSongs'; // ensure this import or define API again

const save = async () => {
  try {
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

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      alert('Failed to save the song');
      return;
    }

    revalidateSongs();
    onClose();
    setCurrent?.(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    console.error('Save failed:', error);
    alert('Something went wrong during save');
  }
};

