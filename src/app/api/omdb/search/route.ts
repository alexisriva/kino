import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') || '';
  const imdbId = searchParams.get('i') || '';
  const type = searchParams.get('type') || ''; // optional: movie, series, episode
  const apiKey = process.env.OMDB_API_KEY;

  if (!title && !imdbId) {
    return NextResponse.json({ error: 'Title or IMDb ID query parameter required' }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json({
      error: 'OMDB_API_KEY is not set in environment variables. You can enter details manually or add an API key.',
      isMissingApiKey: true,
    });
  }

  try {
    let omdbUrl = '';
    if (imdbId) {
      omdbUrl = `https://www.omdbapi.com/?apikey=${apiKey}&i=${encodeURIComponent(imdbId)}&plot=full`;
    } else {
      const typeQuery = type ? `&type=${encodeURIComponent(type)}` : '';
      omdbUrl = `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(title)}${typeQuery}`;
    }

    const res = await fetch(omdbUrl);
    const data = await res.json();

    if (data.Response === 'False') {
      return NextResponse.json({ error: data.Error || 'No results found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch metadata from OMDb' }, { status: 500 });
  }
}
