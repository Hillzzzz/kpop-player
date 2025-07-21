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
        defaultPlayIndex={initialIndex}
        mode="mini"
        toggleMode
        showThemeSwitch={false}
        drag={false}
        remove={false}
        autoHiddenCover
      />
    </div>
  );
}
