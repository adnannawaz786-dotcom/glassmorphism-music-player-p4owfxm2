'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Upload, Volume2, SkipBack, SkipForward, Music } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

const MusicPlayer = () => {
  const [playlist, setPlaylist] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);
  const progressRef = useRef(null);

  // Load playlist from localStorage on mount
  useEffect(() => {
    const savedPlaylist = localStorage.getItem('musicPlaylist');
    if (savedPlaylist) {
      const parsedPlaylist = JSON.parse(savedPlaylist);
      setPlaylist(parsedPlaylist);
      if (parsedPlaylist.length > 0) {
        setCurrentTrack(parsedPlaylist[0]);
        setCurrentTrackIndex(0);
      }
    }
  }, []);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      nextTrack();
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack]);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);

    // Filter ONLY mp3 files by MIME type and extension (extra safety)
    const mp3Files = files.filter(file => {
      const isAudioMIME = file.type === 'audio/mpeg';
      const isMP3Ext = file.name.toLowerCase().endsWith('.mp3');
      return isAudioMIME && isMP3Ext;
    });

    const invalidFilesCount = files.length - mp3Files.length;
    if (invalidFilesCount > 0) {
      alert(`Only MP3 files are supported. ${invalidFilesCount} file(s) were ignored.`);
    }

    if (mp3Files.length === 0) return; // no valid files, do nothing

    const newTracks = mp3Files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name.replace(/\.[^/.]+$/, ''),
      url: URL.createObjectURL(file),
    }));

    setPlaylist(prev => {
      const updated = [...prev, ...newTracks];
      localStorage.setItem('musicPlaylist', JSON.stringify(updated));
      return updated;
    });

    if (!currentTrack) {
      setCurrentTrack(newTracks[0]);
      setCurrentTrackIndex(playlist.length);
    }
  };

  const togglePlay = () => {
    if (!currentTrack) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    if (playlist.length === 0) return;
    
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    setCurrentTrackIndex(nextIndex);
    setCurrentTrack(playlist[nextIndex]);
    setIsPlaying(false);
  };

  const previousTrack = () => {
    if (playlist.length === 0) return;
    
    const prevIndex = currentTrackIndex === 0 ? playlist.length - 1 : currentTrackIndex - 1;
    setCurrentTrackIndex(prevIndex);
    setCurrentTrack(playlist[prevIndex]);
    setIsPlaying(false);
  };

  const selectTrack = (track, index) => {
    setCurrentTrack(track);
    setCurrentTrackIndex(index);
    setIsPlaying(false);
  };

  const handleProgressClick = (event) => {
    if (!audioRef.current || !progressRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (event) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {currentTrack && (
        <audio
          ref={audioRef}
          src={currentTrack.url}
          volume={volume}
        />
      )}

      {/* Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".mp3,audio/mpeg"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white"
          size="lg"
        >
          <Upload className="w-5 h-5 mr-2" />
          Upload MP3 Files
        </Button>
      </motion.div>

      {/* Main Player */}
      <AnimatePresence>
        {currentTrack && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Music className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{currentTrack.name}</h2>
                <p className="text-white/70">Track {currentTrackIndex + 1} of {playlist.length}</p>
              </div>

              <div className="mb-6">
                <div
                  ref={progressRef}
                  className="w-full h-2 bg-white/20 rounded-full cursor-pointer mb-2"
                  onClick={handleProgressClick}
                >
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
                <div className="flex justify-between text-sm text-white/70">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-4 mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={previousTrack}
                  className="text-white hover:bg-white/10"
                  disabled={playlist.length <= 1}
                >
                  <SkipBack className="w-5 h-5" />
                </Button>
                
                <Button
                  onClick={togglePlay}
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full w-16 h-16"
                >
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextTrack}
                  className="text-white hover:bg-white/10"
                  disabled={playlist.length <= 1}
                >
                  <SkipForward className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex items-center justify-center space-x-3">
                <Volume2 className="w-5 h-5 text-white/70" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-24 accent-purple-500"
                />
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {playlist.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/10 backdrop-blur-md border border-white/20 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Playlist ({playlist.length})</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {playlist.map((track, index) => (
                <motion.div
                  key={track.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    currentTrack?.id === track.id
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                  onClick={() => selectTrack(track, index)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium truncate">{track.name}</span>
                    {currentTrack?.id === track.id && isPlaying && (
                      <div className="flex space-x-1">
                        <div className="w-1 h-4 bg-purple-500 rounded animate-pulse"></div>
                        <div className="w-1 h-4 bg-pink-500 rounded animate-pulse delay-75"></div>
                        <div className="w-1 h-4 bg-purple-500 rounded animate-pulse delay-150"></div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {playlist.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Music className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white/70 mb-2">No music uploaded</h3>
          <p className="text-white/50">Upload your MP3 files to get started</p>
        </motion.div>
      )}
    </div>
  );
};

export default MusicPlayer;
