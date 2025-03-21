/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import Wishlist from '@/utils/Wishlist';

import EpisodeT from '@/types/Episode';
import MediaType from '@/types/MediaType';
import Movie from '@/types/Movie';
import Series from '@/types/Series';
import Continue from '@/types/Continue';

import Card from './Card';
import Episode from './Episode';

interface TitleProps {
  type: string;
  id: string;
}

export default function Title({ type, id }: TitleProps) {
  const nav = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLIFrameElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<Movie | Series>();
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [episodes, setEpisodes] = useState<EpisodeT[]>();
  const [maxEpisodes, setMaxEpisodes] = useState(1);

  const [wished, setWished] = useState(false);
  const [extendSuggestions, setExtendSuggestions] = useState(false);
  const [extendEpisodes, setExtendEpisodes] = useState(false);
  
  // New states for video/trailer functionality
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [videoVisible, setVideoVisible] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  function getYear(date: string) {
    const timestamp = Date.parse(date);
    return new Date(timestamp).getFullYear();
  }

  function getLength(runtime: number) {
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;

    if (!hours) {
      return `${minutes}m`;
    }

    return `${hours}h ${minutes}m`;
  }

  function getDownloadUrl_2() {
    let url = type === 'movie'
      ? `${import.meta.env.VITE_MOIVE_DOWNLOAD_2}?id=${id}`
      : `${import.meta.env.VITE_MOIVE_DOWNLOAD_1}?id=${id}&s=${season}&e=${episode}`;
    return url;
  }

  async function getData() {
    const req = await fetch(import.meta.env.VITE_APP_API + '/' + type + '/' + id);
    const res = await req.json();

    if (!res.success) {
      nav('/');
      return;
    }

    const data = res.data;

    setData(data);
    
    // Mock setting trailer URL - in a real app you'd get this from the API
    if (data.trailer) {
      setTrailerUrl(data.trailer);
    }

    if (type !== 'series') return;

    const cont = localStorage.getItem('continue_' + id);

    if (!cont) {
      getEpisodes();
      return;
    }

    const parsed: Continue = JSON.parse(cont);

    setSeason(parsed.season);
    setEpisode(parsed.episode);

    getEpisodes(parsed.season);
  }

  async function getEpisodes(season: number = 1) {
    const req = await fetch(`${import.meta.env.VITE_APP_API}/episodes/${id}?s=${season}`);
    const res = await req.json();

    if (!res.success) {
      nav('/');
      return;
    }

    const data = res.data;

    setEpisodes(data);
    setMaxEpisodes(data.length);
  }

  function onSeasonChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setEpisodes(undefined);

    const s = parseInt(e.target.value);

    setSeason(s);
    getEpisodes(s);
  }

  function onPlusClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    if (!data) return;
    if (type !== 'movie' && type !== 'series') return;

    Wishlist.add({ id: data.id, poster: data.images.poster, title: data.title, type });
  }

  function onCheckClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    if (!data) return;

    Wishlist.remove(data.id, type as MediaType);
  }

  function onWindowClick(e: MouseEvent) {
    if (!ref.current) return;

    if (e.target === ref.current) {
      nav('/');
    }
  }
  
  // New video-related functions
  function handlePlayVideo() {
    if (!trailerUrl) return;
    setVideoVisible(true);
  }
  
  function toggleMute() {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      const iframe = videoRef.current;
      const url = new URL(iframe.src);
      
      if (isMuted) {
        url.searchParams.delete('mute');
      } else {
        url.searchParams.set('mute', '1');
      }
      
      iframe.src = url.toString();
    }
  }
  
  function toggleFullScreen() {
    if (!videoContainerRef.current) return;
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoContainerRef.current.requestFullscreen();
    }
  }

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    window.addEventListener('click', onWindowClick);

    return () => {
      document.body.style.overflow = 'auto';

      window.removeEventListener('click', onWindowClick);
    };
  }, []);

  useEffect(() => {
    if (isNaN(parseInt(id))) {
      return nav('/');
    }

    if (type !== 'movie' && type !== 'series') {
      return nav('/');
    }

    setData(undefined);
    setEpisodes(undefined);
    setVideoVisible(false);
    setVideoLoaded(false);

    setExtendEpisodes(false);
    setExtendSuggestions(false);

    getData();

    return () => {
      setData(undefined);
    };
  }, [type, id]);

  useEffect(() => {
    if (!data) return;

    setWished(Wishlist.has(data.id, type as MediaType));

    function onWishlistChange() {
      if (!data) return;

      setWished(Wishlist.has(data.id, type as MediaType));
    }

    Wishlist.on(data.id, type, onWishlistChange);

    return () => {
      Wishlist.off(data.id, type, onWishlistChange);
    };
  }, [data]);

  if (!data) {
    return <div className="title" ref={ref}></div>;
  }

  return (
    <>
      <Helmet>
        <title>
          {data.title} - {import.meta.env.VITE_APP_NAME}
        </title>
      </Helmet>

      <div className="title" ref={ref}>
        <div className="title-container">
          <div className="title-close" onClick={() => nav('/')}>
            <i className="fa-light fa-close"></i>
          </div>
          
          <div 
            className="title-backdrop" 
            style={{ 
              position: 'relative',
              backgroundImage: `url(${data.images.backdrop})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              minHeight: '40vh',
              overflow: 'hidden',
              cursor: trailerUrl && !videoVisible ? 'pointer' : 'default'
            }}
            onClick={trailerUrl && !videoVisible ? handlePlayVideo : undefined}
          >
            {trailerUrl && !videoVisible && (
              <div 
                className="play-button-overlay"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'rgba(0,0,0,0.5)',
                  borderRadius: '50%',
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 2
                }}
              >
                <i 
                  className="fa-solid fa-play" 
                  style={{
                    color: 'white',
                    fontSize: '32px'
                  }}
                ></i>
              </div>
            )}
            
            {trailerUrl && (
              <div 
                ref={videoContainerRef}
                className="trailer-container" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  position: 'absolute', 
                  top: 0, 
                  left: 0,
                  display: videoVisible ? 'block' : 'none',
                  zIndex: 3
                }}
              >
                <iframe
                  src={videoVisible ? trailerUrl : 'about:blank'}
                  ref={videoRef}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    backgroundColor: '#000',
                    transition: 'opacity 0.5s ease',
                    opacity: videoLoaded ? 1 : 0
                  }}
                  onLoad={() => {
                    setTimeout(() => setVideoLoaded(true), 500);
                  }}
                ></iframe>
              </div>
            )}
          </div>

          <div className="title-content">
            <div className="title-logo">
              <img alt={data.title} src={data.images.logo} />
            </div>

            <div className="left-side-buttons" style={{ display: videoVisible ? 'flex' : 'none' }}>
              {trailerUrl && (
                <>
                  <button className="button" onClick={toggleMute} style={{ zIndex: 10 }}>
                    <i className={`fa-solid ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'}`}></i>
                  </button>

                  <button className="button btn" onClick={toggleFullScreen} style={{ zIndex: 10 }}>
                    <i className="fa-solid fa-expand"></i>
                  </button>
                </>
              )}
            </div>

            <div className="title-actions">
              <Link 
                className="button" 
                to={`/watch/${id}${type === 'series' ? `?s=${season}&e=${episode}` : ''}`}
                style={{ touchAction: 'manipulation' }}
              >
                <i className="fa-solid fa-play"></i>
                <span>{type === 'series' ? `S${season} E${episode}` : 'Play'}</span>
              </Link>

              {wished ? (
                <button className="button" onClick={onCheckClick} style={{ touchAction: 'manipulation' }}>
                  <i className="fa-solid fa-check"></i>
                </button>
              ) : (
                <button className="button secondary" onClick={onPlusClick} style={{ touchAction: 'manipulation' }}>
                  <i className="fa-solid fa-plus"></i>
                </button>
              )}
              <div className="button2">
                <a 
                  href={getDownloadUrl_2()} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ touchAction: 'manipulation' }}
                >
                  <i className="fa-solid fa-download"></i>
                  <span>{type === 'series' ? `S${season} E${episode}` : 'Download'}</span>
                </a>
              </div>
            </div>

            <div className="title-grid">
              <div className="title-col">
                {data.tagline && <h4 className="title-tagline">{data.tagline}</h4>}

                <div className="title-meta">
                  <span className="title-rating">{data.rating}%</span>

                  <span>{getYear(data.date)}</span>

                  {'runtime' in data && <span>{getLength(data.runtime)}</span>}

                  {'seasons' in data && <span>{data.seasons} Seasons</span>}
                </div>

                <p className="title-description">{data.description}</p>
              </div>

              <div className="title-col">
                <div className="title-list">
                  <span className="head">Genres:</span>
                  {data.genres.map((genre, i) => (
                    <Link to={`/genre/${type}/${genre.id}`} key={i}>
                      {genre.name}
                      {i < data.genres.length - 1 && ','}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {'seasons' in data && (
              <div className="title-section">
                <div className="title-row">
                  <h3>Episodes</h3>

                  <select className="title-select" defaultValue={season} onChange={onSeasonChange}>
                    {Array.from({ length: data.seasons }).map((_, i) => (
                      <option key={i} value={i + 1}>
                        Season {i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="title-episodes">
                  {episodes &&
                    episodes.map((episode, i) => {
                      if (!extendEpisodes && i > 9) return null;

                      return <Episode key={i} {...episode} id={data.id} season={season} maxEpisodes={maxEpisodes} />;
                    })}
                </div>

                {episodes && episodes.length > 10 && (
                  <div className={`title-extend ${extendEpisodes ? 'active' : ''}`}>
                    <button className="button secondary" onClick={() => setExtendEpisodes(!extendEpisodes)}>
                      {extendEpisodes ? <i className="fa-solid fa-chevron-up"></i> : <i className="fa-solid fa-chevron-down"></i>}
                    </button>
                  </div>
                )}
              </div>
            )}

            {data.suggested && data.suggested.length > 0 && (
              <div className="title-section">
                <h3>More Like This</h3>

                <div className="title-cards">
                  {data.suggested.map((media, i) => {
                    if (!extendSuggestions && i > 7) return null;

                    return <Card key={i} {...media} />;
                  })}
                </div>

                {data.suggested.length > 8 && (
                  <div className={`title-extend ${extendSuggestions ? 'active' : ''}`}>
                    <button className="button secondary" onClick={() => setExtendSuggestions(!extendSuggestions)}>
                      {extendSuggestions ? <i className="fa-solid fa-chevron-up"></i> : <i className="fa-solid fa-chevron-down"></i>}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
