import { FastifyPluginAsync } from 'fastify';
import type { RssHeadline } from '@ts-template/shared';

const SPIEGEL_RSS_URL = process.env.SPIEGEL_RSS_URL || 'https://www.spiegel.de/schlagzeilen/index.rss';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const REQUEST_TIMEOUT = 2000; // 2 seconds

let cache: { data: RssHeadline | null; timestamp: number } = { data: null, timestamp: 0 };

// Export function to reset cache for testing
export const resetCache = (): void => {
  cache = { data: null, timestamp: 0 };
};

const parseRssItem = (itemText: string): RssHeadline | null => {
  const titleMatch = itemText.match(/<title>([^<]+)<\/title>/);
  const linkMatch = itemText.match(/<link>([^<]+)<\/link>/);
  const pubDateMatch = itemText.match(/<pubDate>([^<]+)<\/pubDate>/);

  if (!titleMatch || !linkMatch) {
    return null;
  }

  const title = titleMatch[1]
    ?.replace(/<!\[CDATA\[/, '')
    ?.replace(/\]\]>/, '')
    ?.trim() ?? '';

  const link = linkMatch[1]
    ?.replace(/<!\[CDATA\[/, '')
    ?.replace(/\]\]>/, '')
    ?.trim() ?? '';

  const publishedAt = pubDateMatch?.[1]
    ? new Date(pubDateMatch[1]).toISOString()
    : new Date().toISOString();

  return {
    title,
    link,
    publishedAt,
    source: 'SPIEGEL'
  };
};

const fetchLatestHeadline = async (): Promise<RssHeadline | null> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(SPIEGEL_RSS_URL, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/rss+xml, application/xml, text/xml',
        'User-Agent': 'Mozilla/5.0 (compatible; TypeScript-Template/1.0)'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`RSS fetch failed: ${response.status}`);
    }

    const rssText = await response.text();

    // Extract first item from RSS feed
    const firstItemMatch = rssText.match(/<item[^>]*>([\s\S]*?)<\/item>/);

    if (!firstItemMatch) {
      return null;
    }

    return parseRssItem(firstItemMatch[1] ?? '');
  } catch (error) {
    console.error('Failed to fetch RSS:', error);
    return null;
  }
};

export const rssRoute: FastifyPluginAsync = async function (fastify) {
  fastify.get<{ Reply: RssHeadline | { error: string } }>(
    '/rss/spiegel/latest',
    {
      schema: {
        description: 'Get the latest SPIEGEL RSS headline',
        tags: ['rss'],
        response: {
          200: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Headline title',
              },
              link: {
                type: 'string',
                description: 'URL to the article',
              },
              publishedAt: {
                type: 'string',
                description: 'ISO 8601 date string',
              },
              source: {
                type: 'string',
                description: 'News source',
              },
            },
            required: ['title', 'link', 'publishedAt', 'source'],
          },
          503: {
            type: 'object',
            properties: {
              error: {
                type: 'string',
                description: 'Error message',
              },
            },
          },
        },
      },
    },
    async function (_request, reply) {
      // Check cache first
      const now = Date.now();
      if (cache.data && (now - cache.timestamp) < CACHE_TTL) {
        return cache.data;
      }

      // Fetch fresh data
      const headline = await fetchLatestHeadline();

      if (!headline) {
        reply.code(503);
        return { error: 'Unable to fetch RSS feed' };
      }

      // Update cache
      cache = { data: headline, timestamp: now };

      return headline;
    }
  );
};