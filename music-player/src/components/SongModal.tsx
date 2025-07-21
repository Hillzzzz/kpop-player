import { revalidateSongs } from '../hooks/useSongs';
import { API } from '../hooks/useSongs';

const save = async () => {
  try {
    // Upload audio file if needed
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

    // Save metadata
    const method = initial ? 'PUT' : 'POST';
    const url = initial ? `${API}/songs/${initial.id}` : `${API}/songs`;

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      alert('Failed to save song');
      return;
    }

    revalidateSongs();
    onClose();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    console.error('Save failed:', err);
    alert('Something went wrong');
  }
};
