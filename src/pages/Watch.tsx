import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Movie from '@/types/Movie';
import Series from '@/types/Series';
import MediaType from '@/types/MediaType';

export default function Watch() {
  const nav = useNavigate();
  const { id } = useParams();
  const [search] = useSearchParams();
  const [type, setType] = useState<MediaType>('movie');
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [maxEpisodes, setMaxEpisodes] = useState(1);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const sources = [
    { name: 'Braflix', url: 'https://vid.braflix.win/embed' },
    { name: 'Vidlink', url: 'https://vidlink.pro/' },
    { name: 'Multi', url: 'https://vidsrc.dev/embed' },
    { name: 'Viaplay', url: 'https://api.vidsrc.win/vid.html' },
    { name: 'Vidplay', url: 'https://vidsrc.cc/v2/embed' },
    { name: 'Pro', url: 'https://vidsrc.pro/embed/' },
    { name: 'Vidsrc', url: 'https://vidsrc.io/embed' },
    { name: '2embed', url: 'https://www.2embed.stream/embed/' },
    { name: 'PrimeWire', url: 'https://www.primewire.tf/embed' },
    { name: 'LimeWire', url: 'https://bombthe.irish/embed/' },
    { name: 'Hindi HD', url: 'https://api.vidsrc.win/hindi.html' },
    { name: 'Autoembed', url: 'https://player.autoembed.cc/embed' },
    { name: 'India I', url: 'https://api.vidsrc.win/green.html' },
    { name: 'India II', url: 'https://api.vidsrc.win/embed.html' },
    { name: 'India III', url: 'https://api.vidsrc.win/api.html' },
    { name: 'Brazil', url: 'https://embed.warezcdn.com' },
    { name: 'Super', url: 'https://api.vidsrc.win/super.html' },
    { name: 'Flixy', url: 'https://flicky.host/embed' }
  ];

  const specialSeriesSourcesMap: { [key: string]: string } = {
    'India I': 'https://api.vidsrc.win/greentv.html',
    'India II': 'https://api.vidsrc.win/embedtv.html',
    'Viaplay': 'https://api.vidsrc.win/vidtv.html',
    'Hindi HD': 'https://api.vidsrc.win/hinditv.html',
    'Super': 'https://api.vidsrc.win/vidtv.html'
  };

  const [source, setSource] = useState<string>(() => {
    // Default to 'Braflix' for first-time users
    const savedSource = localStorage.getItem('selectedSource');
    return savedSource || 'Braflix';
  });

  useEffect(() => {
    // Save the source to localStorage whenever it changes
    localStorage.setItem('selectedSource', source);
  }, [source]);

  const getSource = () => {
    const baseSource = sources.find((s) => s.name === source)?.url || '';
    if (type === 'movie') {
      if (source === 'Brazil') {
        return `${baseSource}/filme/${id}`;
      } else if (source === 'PrimeWire') {
        return `${baseSource}/movie?tmdb=${id}`;
      } else if (source === 'Multi') {
        return `https://vidsrc.dev/embed/movie/${id}`;
      } else if (source === 'Flixy') {
        return `${baseSource}/movie/?id=${id}`;
      } else if (specialSeriesSourcesMap[source]) {
        return `${baseSource}?id=${id}`;
      } else if (source === 'India III') {
        return `${baseSource}?id=${id}`;
      } else {
        return `${baseSource}/movie/${id}`;
      }
    } else if (type === 'series') {
      if (source === 'Brazil') {
        return `${baseSource}/serie/${id}/${season}/${episode}`;
      } else if (source === 'PrimeWire') {
        return `${baseSource}/tv?tmdb=${id}&season=${season}&episode=${episode}`;
      } else if (source === 'Multi') {
        return `https://vidsrc.dev/embed/tv/${id}/${season}/${episode}`;
      } else if (source === 'Flixy') {
        return `${baseSource}/tv/?id=${id}/${season}/${episode}`;
      } else if (specialSeriesSourcesMap[source]) {
        return `${specialSeriesSourcesMap[source]}?id=${id}&s=${season}&e=${episode}`;
      } else if (source === 'India III') {
        return `${baseSource}?id=${id}&s=${season}&e=${episode}`;
      } else {
        return `${baseSource}/tv/${id}/${season}/${episode}`;
      }
    }
    return '';
  };

  return (
    <>
      <Helmet>
        <title>Watch - {import.meta.env.VITE_APP_NAME || 'My App'}</title>
      </Helmet>

      <div className="player">
        <div className="player-controls">
          <i
            className="fa-regular fa-arrow-left"
            onClick={() => nav(`/${type}/${id}`)}
          ></i>
          {type === 'series' && episode < maxEpisodes && (
            <i
              className="fa-regular fa-forward-step right"
              onClick={() =>
                nav(`/watch/${id}?s=${season}&e=${episode + 1}&me=${maxEpisodes}`)
              }
            ></i>
          )}
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
          >
            {sources.map((s, index) => (
              <option key={index} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <iframe
          ref={iframeRef}
          src={getSource()}
          width="100%"
          height="100%"
          allowFullScreen
          title="Video Player"
          referrerPolicy="origin"
        />
      </div>
    </>
  );
}
