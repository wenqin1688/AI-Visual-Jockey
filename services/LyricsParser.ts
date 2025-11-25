export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export const parseLrc = (lrcContent: string): LyricLine[] => {
  const lines = lrcContent.split('\n');
  const lyrics: LyricLine[] = [];
  
  // Regex to match [mm:ss.xx] or [mm:ss.xxx]
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;

  for (const line of lines) {
    const match = timeRegex.exec(line);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const milliseconds = parseInt(match[3], 10); // can be 2 or 3 digits
      
      // Convert to total seconds
      // if 2 digits (e.g. .50), it's 500ms. If 3 digits (.500), it's 500ms.
      // Standard LRC usually treats .xx as centiseconds (1/100).
      const msFactor = match[3].length === 3 ? 1000 : 100;
      const totalSeconds = minutes * 60 + seconds + milliseconds / msFactor;
      
      const text = match[4].trim();

      if (text) {
        lyrics.push({
          time: totalSeconds,
          text: text
        });
      }
    }
  }

  return lyrics;
};
