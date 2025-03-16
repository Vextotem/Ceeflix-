import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Movie from '@/types/Movie';
import Series from '@/types/Series';
import MediaType from '@/types/MediaType';
import MediaShort from '@/types/MediaShort';

interface Source {
  name: string;
  url: string;
}

interface SpecialSourceMap {
  [key: string]: string;
}

const SERIES_URL_PARAMS = 'nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&color=#E50914';

const SOURCES: Source[] = [
  { name: 'Braflix', url: 'https://api.braflix.win/embed' },
  { name: '4K', url: 'https://player.videasy.net' },
  { name: 'Vidlink', url: 'https://vidlink.pro/' },
  { name: 'Nero', url: 'https://vidfast.pro/' },  
  { name: 'Multi', url: 'https://vidsrc.dev/embed' },  
  { name: 'Vidplay', url: 'https://vidsrc.cc/v2/embed' },
  { name: 'Pro', url: 'https://vidsrc.pro/embed/' },
  { name: 'Vidsrc', url: 'https://vidsrc.io/embed' },
  { name: '2embed', url: 'https://www.2embed.stream/embed/' },
  { name: 'Kex', url: 'https://moviekex.online/embed/' },
  { name: 'Slime', url: 'https://vidsrc.vip/embed/' },
  { name: 'PrimeWire', url: 'https://www.primewire.tf/embed' },
  { name: 'Club', url: 'https://moviesapi.club/' },
  { name: 'Sage', url: 'https://111movies.com/' },
  { name: 'Autoembed', url: 'https://player.autoembed.cc/embed' },
  { name: 'India 420p', url: 'https://api.vidsrc.win/api.html' },
  { name: 'Brazil', url: 'https://embed.warezcdn.com' },
  { name: 'Flix', url: 'https://vidsrc.su/embed' }
];

const SPECIAL_SERIES_SOURCES: SpecialSourceMap = {
  

const MAX_VIEWED_ITEMS = 15;
const LOCAL_STORAGE_KEYS = {
  selectedSource: 'selectedSource',
  viewed: 'viewed'
} as const;

export default function Watch() {
  const nav = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [search] = useSearchParams();
  const [type, setType] = useState<MediaType>('movie');
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [maxEpisodes, setMaxEpisodes] = useState(1);
  const [data, setData] = useState<Movie | Series>();
  const [source, setSource] = useState<string>(() => 
    localStorage.getItem(LOCAL_STORAGE_KEYS.selectedSource) || SOURCES[0].name
  );
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const addViewed = (mediaData: MediaShort): void => {
    const viewed: MediaShort[] = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_KEYS.viewed) || '[]'
    );
    
    const updatedViewed = [
      mediaData,
      ...viewed.filter(v => !(v.id === mediaData.id && v.type === mediaData.type))
    ].slice(0, MAX_VIEWED_ITEMS);
    
    localStorage.setItem(LOCAL_STORAGE_KEYS.viewed, JSON.stringify(updatedViewed));
  };

  const getSourceUrl = (): string => {
    const sourceData = SOURCES.find(s => s.name === source);
    if (!sourceData) return '';

    const { url: baseSource } = sourceData;
    const isSpecialSource = SPECIAL_SERIES_SOURCES[source];

    if (type === 'movie') {
      return constructMovieUrl(baseSource);
    }
    return constructSeriesUrl(baseSource, isSpecialSource);
  };

  const constructMovieUrl = (baseSource: string): string => {
    switch (source) {
      case 'Brazil':
        return `${baseSource}/filme/${id}`;
      case 'PrimeWire':
        return `${baseSource}/movie?tmdb=${id}`;
      case 'Multi':
        return `https://vidsrc.dev/embed/movie/${id}`;
      case 'Flix':
        return `${baseSource}/movie/?id=${id}`;
      default:
        return SPECIAL_SERIES_SOURCES[source] || source === 'India 420p'
          ? `${baseSource}?id=${id}`
          : `${baseSource}/movie/${id}`;
    }
  };

  const constructSeriesUrl = (baseSource: string, isSpecialSource: string): string => {
  let url: string;

  switch (source) {
    case 'Brazil':
      url = `${baseSource}/serie/${id}/${season}/${episode}`;
      break;
    case 'PrimeWire':
      url = `${baseSource}/tv?tmdb=${id}&season=${season}&episode=${episode}`;
      break;
    case 'Multi':
      url = `https://vidsrc.dev/embed/tv/${id}/${season}/${episode}`;
      break;
    case 'lix':
      url = `${baseSource}/tv/?id=${id}/${season}/${episode}`;
      break;
    case 'Club':
      url = `${baseSource}/tv/${id}-${season}-${episode}`;
      break;
    case '4K':
      url = `${baseSource}/tv/${id}/${season}/${episode}`;
      url += url.includes('?') ? `&${SERIES_URL_PARAMS}` : `?${SERIES_URL_PARAMS}`;
      break;
    case 'Vidlink': // Fixing Vidlink TV URL
      url = `${baseSource}/tv/${id}/${season}/${episode}`;
      url += url.includes('?') 
        ? `&primaryColor=63b8bc&secondaryColor=a2a2a2&iconColor=eefdec&icons=default&player=default&title=true&poster=true&autoplay=true&nextbutton=true`
        : `?primaryColor=63b8bc&secondaryColor=a2a2a2&iconColor=eefdec&icons=default&player=default&title=true&poster=true&autoplay=true&nextbutton=true`;
      break;
    default:
      if (isSpecialSource || source === 'India 420p') {
        url = `${isSpecialSource || baseSource}?id=${id}&s=${season}&e=${episode}`;
      } else {
        url = `${baseSource}/tv/${id}/${season}/${episode}`;
      }
      break;
  }

  // Append ?autonext=1&ds_lang=en for Braflix TV series
  if (source === 'Braflix' && type === 'series') {
    url += url.includes('?') ? '&autonext=1&ds_lang=en' : '?autonext=1&ds_lang=en';
  }

  return url;
};

  const fetchData = async (mediaType: MediaType): Promise<void> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_API}/${mediaType}/${id}`);
      const result = await response.json();
      
      if (!result.success) return;

      setData(result.data);
      addViewed({
        id: result.data.id,
        poster: result.data.images.poster,
        title: result.data.title,
        type: mediaType,
      });
    } catch (error) {
      console.error('Error fetching media data:', error);
    }
  };

  const fetchMaxEpisodes = async (seasonNumber: number): Promise<void> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_API}/episodes/${id}?s=${seasonNumber}`
      );
      const result = await response.json();
      
      if (!result.success) {
        nav('/');
        return;
      }
      
      setMaxEpisodes(result.data.length);
    } catch (error) {
      console.error('Error fetching episode data:', error);
      nav('/');
    }
  };

  useEffect(() => {
    if (!data || !('seasons' in data)) return;
    if (season > data.seasons || episode > maxEpisodes) {
      nav('/');
    }
  }, [data, maxEpisodes, season, episode, nav]);

  useEffect(() => {
    const s = search.get('s');
    const e = search.get('e');
    const me = search.get('me');

    if (!s || !e) {
      setType('movie');
      fetchData('movie');
      return;
    }

    setSeason(Number(s));
    setEpisode(Number(e));
    setType('series');
    fetchData('series');

    if (me) {
      setMaxEpisodes(Number(me));
    } else {
      fetchMaxEpisodes(Number(s));
    }
  }, [id, search]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.selectedSource, source);
  }, [source]);

  return (
    <>
      <Helmet>
        <title>
          {data?.title} - {import.meta.env.VITE_APP_NAME}
        </title>
      </Helmet>

      <div className="player">
        <div className="player-controls">
          <i
            className="fa-regular fa-arrow-left"
            onClick={() => nav(`/${type}/${id}`)}
          />
          {type === 'series' && episode < maxEpisodes && (
            <i
              className="fa-regular fa-forward-step right"
              onClick={() =>
                nav(`/watch/${id}?s=${season}&e=${episode + 1}&me=${maxEpisodes}`)
              }
            />
          )}
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
          >
            {SOURCES.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <iframe
          ref={iframeRef}
          src={getSourceUrl()}
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
