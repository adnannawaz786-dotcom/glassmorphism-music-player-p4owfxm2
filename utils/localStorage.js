// localStorage utility functions for music files

const STORAGE_KEY = 'music_player_files';
const CURRENT_TRACK_KEY = 'music_player_current_track';
const PLAYER_STATE_KEY = 'music_player_state';

/**
 * Save music files to localStorage
 * @param {Array} files - Array of file objects with metadata
 */
export const saveMusicFiles = (files) => {
  try {
    const serializedFiles = JSON.stringify(files);
    localStorage.setItem(STORAGE_KEY, serializedFiles);
  } catch (error) {
    console.error('Error saving music files to localStorage:', error);
  }
};

/**
 * Get music files from localStorage
 * @returns {Array} Array of file objects
 */
export const getMusicFiles = () => {
  try {
    const serializedFiles = localStorage.getItem(STORAGE_KEY);
    return serializedFiles ? JSON.parse(serializedFiles) : [];
  } catch (error) {
    console.error('Error getting music files from localStorage:', error);
    return [];
  }
};

/**
 * Add a single music file to localStorage
 * @param {Object} file - File object with metadata
 */
export const addMusicFile = (file) => {
  try {
    const existingFiles = getMusicFiles();
    const updatedFiles = [...existingFiles, file];
    saveMusicFiles(updatedFiles);
  } catch (error) {
    console.error('Error adding music file to localStorage:', error);
  }
};

/**
 * Remove a music file from localStorage by ID
 * @param {string} fileId - Unique identifier for the file
 */
export const removeMusicFile = (fileId) => {
  try {
    const existingFiles = getMusicFiles();
    const updatedFiles = existingFiles.filter(file => file.id !== fileId);
    saveMusicFiles(updatedFiles);
  } catch (error) {
    console.error('Error removing music file from localStorage:', error);
  }
};

/**
 * Save current track information
 * @param {Object} trackInfo - Current track metadata
 */
export const saveCurrentTrack = (trackInfo) => {
  try {
    const serializedTrack = JSON.stringify(trackInfo);
    localStorage.setItem(CURRENT_TRACK_KEY, serializedTrack);
  } catch (error) {
    console.error('Error saving current track to localStorage:', error);
  }
};

/**
 * Get current track information
 * @returns {Object|null} Current track metadata or null
 */
export const getCurrentTrack = () => {
  try {
    const serializedTrack = localStorage.getItem(CURRENT_TRACK_KEY);
    return serializedTrack ? JSON.parse(serializedTrack) : null;
  } catch (error) {
    console.error('Error getting current track from localStorage:', error);
    return null;
  }
};

/**
 * Save player state (volume, position, etc.)
 * @param {Object} playerState - Player state object
 */
export const savePlayerState = (playerState) => {
  try {
    const serializedState = JSON.stringify(playerState);
    localStorage.setItem(PLAYER_STATE_KEY, serializedState);
  } catch (error) {
    console.error('Error saving player state to localStorage:', error);
  }
};

/**
 * Get player state
 * @returns {Object} Player state object with defaults
 */
export const getPlayerState = () => {
  try {
    const serializedState = localStorage.getItem(PLAYER_STATE_KEY);
    const defaultState = {
      volume: 1,
      currentTime: 0,
      isPlaying: false,
      isMuted: false
    };
    return serializedState ? { ...defaultState, ...JSON.parse(serializedState) } : defaultState;
  } catch (error) {
    console.error('Error getting player state from localStorage:', error);
    return {
      volume: 1,
      currentTime: 0,
      isPlaying: false,
      isMuted: false
    };
  }
};

/**
 * Clear all music player data from localStorage
 */
export const clearAllMusicData = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CURRENT_TRACK_KEY);
    localStorage.removeItem(PLAYER_STATE_KEY);
  } catch (error) {
    console.error('Error clearing music data from localStorage:', error);
  }
};

/**
 * Check if localStorage is available
 * @returns {boolean} True if localStorage is available
 */
export const isLocalStorageAvailable = () => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Convert file to base64 for storage
 * @param {File} file - File object to convert
 * @returns {Promise<string>} Base64 string representation
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

/**
 * Create file metadata object
 * @param {File} file - Original file object
 * @param {string} base64Data - Base64 encoded file data
 * @returns {Object} File metadata object
 */
export const createFileMetadata = (file, base64Data) => {
  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    data: base64Data,
    addedAt: new Date().toISOString()
  };
};