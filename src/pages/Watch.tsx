import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Movie from '@/types/Movie';
import Series from '@/types/Series';
import MediaType from '@/types/MediaType';
import MediaShort from '@/types/MediaShort';

export default function Watch() {
  const nav = useNavigate();
  const { id } = useParams();
  const [search] = useSearchParams();
  const [type, setType] = useState<MediaType>('movie');
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [maxEpisodes, setMaxEpisodes] = useState(1);
  const [data, setData] = useState<Movie | Series>();
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
    { name: 'Flixy', url: 'https://flicky.host/embed' },
  ];

  const specialSeriesSourcesMap: { [key: string]: string } = {
    'India I': 'https://api.vidsrc.win/greentv.html',
    'India II': 'https://api.vidsrc.win/embedtv.html',
    Viaplay: 'https://api.vidsrc.win/vidtv.html',
    'Hindi HD': 'https://api.vidsrc.win/hinditv.html',
    Super: 'https://api.vidsrc.win/vidtv.html',
  };

  const [source, setSource] = useState<string>(
    localStorage.getItem('selectedSource') || 'Braflix'
  );

  function getSource() {
    const baseSource = sources.find((s) => s.name === source)?.url;
    if (!baseSource) return '';

    let url;
    if (type === 'movie') {
      if (source === 'Brazil') {
        url = `${baseSource}/filme/${id}`;
      } else if (source === 'PrimeWire') {
        url = `${baseSource}/movie?tmdb=${id}`;
      } else if (source === 'Multi') {
        url = `https://vidsrc.dev/embed/movie/${id}`;
      } else if (source === 'Flixy') {
        url = `${baseSource}/movie/?id=${id}`;
      } else if (specialSeriesSourcesMap[source]) {
        url = `${baseSource}?id=${id}`;
      } else if (source === 'India III') {
        url = `${baseSource}?id=${id}`;
      } else {
        url = `${baseSource}/movie/${id}`;
      }
    } else if (type === 'series') {
      if (source === 'Brazil') {
        url = `${baseSource}/serie/${id}/${season}/${episode}`;
      } else if (source === 'PrimeWire') {
        url = `${baseSource}/tv?tmdb=${id}&season=${season}&episode=${episode}`;
      } else if (source === 'Multi') {
        url = `https://vidsrc.dev/embed/tv/${id}/${season}/${episode}`;
      } else if (source === 'Flixy') {
        url = `${baseSource}/tv/?id=${id}/${season}/${episode}`;
      } else if (specialSeriesSourcesMap[source]) {
        url = `${specialSeriesSourcesMap[source]}?id=${id}&s=${season}&e=${episode}`;
      } else if (source === 'India III') {
        url = `${baseSource}?id=${id}&s=${season}&e=${episode}`;
      } else {
        url = `${baseSource}/tv/${id}/${season}/${episode}`;
      }
    }
    return url;
  }

  return (
    <>
      <Helmet>
        <title>{data?.title} - {import.meta.env.VITE_APP_NAME}</title>
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
            onChange={(e) => {
              const newSource = e.target.value;
              setSource(newSource);
              localStorage.setItem('selectedSource', newSource);
            }}
          >
            {sources.map((s, index) => (
              <option key={index} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <iframe
          key={source}
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
