import { useState, useRef, useCallback, useEffect } from 'react';
import type { Item, PlayerState } from '../types';

const initialState: PlayerState = {
  currentItem: null,
  isPlaying: false,
  volume: 1,
  currentTime: 0,
  duration: 0,
  queue: [],
  queueIndex: -1,
};

export function usePlayer() {
  const [state, setState] = useState<PlayerState>(initialState);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = state.volume;

    const audio = audioRef.current;

    audio.addEventListener('timeupdate', () => {
      setState(s => ({ ...s, currentTime: audio.currentTime }));
    });

    audio.addEventListener('durationchange', () => {
      setState(s => ({ ...s, duration: audio.duration }));
    });

    audio.addEventListener('ended', () => {
      // Auto-play next in queue
      setState(s => {
        if (s.queueIndex < s.queue.length - 1) {
          const nextIndex = s.queueIndex + 1;
          const nextItem = s.queue[nextIndex];
          audio.src = `/api/item/${nextItem.id}/file`;
          audio.play();
          return { ...s, currentItem: nextItem, queueIndex: nextIndex, isPlaying: true };
        }
        return { ...s, isPlaying: false };
      });
    });

    audio.addEventListener('play', () => {
      setState(s => ({ ...s, isPlaying: true }));
    });

    audio.addEventListener('pause', () => {
      setState(s => ({ ...s, isPlaying: false }));
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const play = useCallback((item: Item) => {
    if (audioRef.current) {
      audioRef.current.src = `/api/item/${item.id}/file`;
      audioRef.current.play();
      setState(s => ({
        ...s,
        currentItem: item,
        isPlaying: true,
        queue: [item],
        queueIndex: 0,
      }));
    }
  }, []);

  const playAlbum = useCallback((items: Item[], startIndex: number = 0) => {
    if (audioRef.current && items.length > 0) {
      const item = items[startIndex];
      audioRef.current.src = `/api/item/${item.id}/file`;
      audioRef.current.play();
      setState(s => ({
        ...s,
        currentItem: item,
        isPlaying: true,
        queue: items,
        queueIndex: startIndex,
      }));
    }
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play();
  }, []);

  const togglePlayPause = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      resume();
    }
  }, [state.isPlaying, pause, resume]);

  const next = useCallback(() => {
    if (state.queueIndex < state.queue.length - 1) {
      const nextIndex = state.queueIndex + 1;
      const nextItem = state.queue[nextIndex];
      if (audioRef.current) {
        audioRef.current.src = `/api/item/${nextItem.id}/file`;
        audioRef.current.play();
      }
      setState(s => ({
        ...s,
        currentItem: nextItem,
        queueIndex: nextIndex,
        isPlaying: true,
      }));
    }
  }, [state.queueIndex, state.queue]);

  const previous = useCallback(() => {
    // If more than 3 seconds in, restart current track
    if (state.currentTime > 3) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
      return;
    }

    if (state.queueIndex > 0) {
      const prevIndex = state.queueIndex - 1;
      const prevItem = state.queue[prevIndex];
      if (audioRef.current) {
        audioRef.current.src = `/api/item/${prevItem.id}/file`;
        audioRef.current.play();
      }
      setState(s => ({
        ...s,
        currentItem: prevItem,
        queueIndex: prevIndex,
        isPlaying: true,
      }));
    }
  }, [state.queueIndex, state.queue, state.currentTime]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    setState(s => ({ ...s, volume }));
  }, []);

  const addToQueue = useCallback((item: Item) => {
    setState(s => ({
      ...s,
      queue: [...s.queue, item],
    }));
  }, []);

  const clearQueue = useCallback(() => {
    setState(s => ({
      ...s,
      queue: s.currentItem ? [s.currentItem] : [],
      queueIndex: s.currentItem ? 0 : -1,
    }));
  }, []);

  return {
    ...state,
    play,
    playAlbum,
    pause,
    resume,
    togglePlayPause,
    next,
    previous,
    seek,
    setVolume,
    addToQueue,
    clearQueue,
  };
}
