export const findLyrics = async (filename: string): Promise<string | null> => {
  // 1. Clean filename to get a search query
  // Removes extension, text in brackets like (Official Video), [HQ], etc.
  const query = filename
    .replace(/\.(mp3|wav|flac|m4a|ogg|aac)$/i, '') // Remove extension
    .replace(/\[.*?\]/g, '') // Remove [text]
    .replace(/\(.*?\)/g, '') // Remove (text)
    .replace(/[-_]/g, ' ')   // Replace separators with spaces
    .replace(/\s+/g, ' ')    // Collapse extra spaces
    .trim();

  console.log(`Searching lyrics for query: "${query}"`);

  try {
    // 2. Query LRCLIB API
    const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();

    // 3. Return the first synced lyric found
    if (Array.isArray(data) && data.length > 0) {
        // Sort by duration match if we had duration, but for now just pick the best synced one
        const synced = data.find((track: any) => track.syncedLyrics);
        if (synced) return synced.syncedLyrics;
        
        // Return plain if synced is missing, though we prefer synced
        if (data[0].plainLyrics) return null; 
    }

    return null;
  } catch (error) {
    console.error("Error fetching lyrics:", error);
    return null;
  }
};