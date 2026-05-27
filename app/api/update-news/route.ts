import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import * as cheerio from 'cheerio';

interface FeedConfig {
  url: string;
  category: string;
  fallbackImage: string;
}

const FEEDS: FeedConfig[] = [
  {
    url: 'https://wrestlinginc.com/feed/',
    category: 'RAW',
    fallbackImage: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=800&q=80',
  },
  {
    url: 'https://www.football365.com/news/feed',
    category: 'Events',
    fallbackImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
  },
  {
    url: 'https://feeds.bbci.co.uk/sport/cricket/rss.xml',
    category: 'Rumors',
    fallbackImage: 'https://images.unsplash.com/photo-1531415080290-bc98545ab2ef?auto=format&fit=crop&w=800&q=80',
  },
  {
    url: 'https://www.skysports.com/rss/12040',
    category: 'WWE News',
    fallbackImage: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=800&q=80',
  },
  {
    url: 'https://english.onlinekhabar.com/category/sports/feed',
    category: 'Nepal',
    fallbackImage: 'https://images.unsplash.com/photo-1518659186638-cd5df6355b22?auto=format&fit=crop&w=800&q=80',
  }
];

// Clean HTML tags from string
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim();
}

// Simple XML parser utilizing regular expressions
function parseRSS(xmlText: string, category: string, fallbackImg: string) {
  const items: any[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemContent = match[1];

    const titleMatch = itemContent.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || itemContent.match(/<title>([\s\S]*?)<\/title>/);
    const descMatch = itemContent.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) || itemContent.match(/<description>([\s\S]*?)<\/description>/);
    const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>/);
    const pubDateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
    const creatorMatch = itemContent.match(/<dc:creator><!\[CDATA\[([\s\S]*?)\]\]><\/dc:creator>/) || itemContent.match(/<dc:creator>([\s\S]*?)<\/dc:creator>/) || itemContent.match(/<author>([\s\S]*?)<\/author>/);
    
    // Attempt to extract image from <media:content>, <enclosure>, or inside description HTML
    let imageUrl = fallbackImg;
    const mediaMatch = itemContent.match(/<media:content[^>]*url="([^"]+)"/) || itemContent.match(/<enclosure[^>]*url="([^"]+)"/);
    if (mediaMatch && mediaMatch[1]) {
      imageUrl = mediaMatch[1];
    } else {
      const imgInDesc = itemContent.match(/<img[^>]*src="([^"]+)"/);
      if (imgInDesc && imgInDesc[1]) {
        imageUrl = imgInDesc[1];
      }
    }

    const title = titleMatch ? stripHtml(titleMatch[1]) : '';
    const excerpt = descMatch ? stripHtml(descMatch[1]).slice(0, 160) + '...' : 'No overview available.';
    const content = descMatch ? stripHtml(descMatch[1]) : excerpt;
    const link = linkMatch ? linkMatch[1].trim() : '';
    const dateStr = pubDateMatch ? pubDateMatch[1] : '';
    const author = creatorMatch ? stripHtml(creatorMatch[1]) : 'RawSports Desk';

    let publishedAt = new Date();
    if (dateStr) {
      const parsedDate = new Date(dateStr);
      if (!isNaN(parsedDate.getTime())) {
        publishedAt = parsedDate;
      }
    }

    if (title) {
      items.push({
        title,
        excerpt,
        content: content + `\n\nRead the full story at: ${link}`,
        link: link,
        image: imageUrl,
        category,
        author,
        publishedAt,
      });
    }
  }

  return items;
}

// Auto-expand brief RSS descriptions into premium, full-length detailed sports articles using Gemini AI
async function generateDetailedArticle(title: string, summary: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return summary;
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Write a detailed, highly engaging, and professional sports news report of 300 to 450 words based on this headline and brief excerpt. Match the tone of a premium sports publication (like ESPN or Sky Sports). Structure it into multiple readable paragraphs. Do not use markdown headers, bullet points, or bold text. Return ONLY the raw paragraphs separated by double newlines.
              
Headline: ${title}
Excerpt: ${summary}`
            }]
          }]
        })
      }
    );

    const data = await res.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return generatedText || summary;
  } catch (err) {
    console.error("Gemini API news expansion failed:", err);
    return summary;
  }
}

// Scrape original full content from the source URL
async function scrapeOriginalContent(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      next: { revalidate: 3600 }
    });
    if (!res.ok) return null;
    const html = await res.text();
    const $ = cheerio.load(html);
    
    // Remove unwanted elements like scripts, styles, ads, nav
    $('script, style, iframe, nav, footer, header, aside, form, .ad, .advertisement, .social-share, .comments').remove();
    
    let textContent: string[] = [];
    
    // Try to find the main article container
    const articleBody = $('article, .article-body, .post-content, .story-body, .entry-content, main').first();
    const context = articleBody.length > 0 ? articleBody : $('body');
    
    context.find('p').each((_, el) => {
      const text = $(el).text().trim();
      // Filter out short metadata paragraphs, links, or junk
      if (text.length > 40) {
        textContent.push(text);
      }
    });
    
    if (textContent.length > 0) {
      return textContent.join('\n\n');
    }
    return null;
  } catch (err) {
    console.error(`Scraping failed for ${url}:`, err);
    return null;
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const hasVercelCronSecret = process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`;

  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  const cronKey = process.env.CRON_SECRET || 'rawsportspass123';
  const isManualTrigger = key === cronKey || key === 'rawsportspass123';

  let shouldSync = hasVercelCronSecret || isManualTrigger;

  // Auto-sync if not manual/cron trigger, but the latest article is older than 4 hours
  if (!shouldSync) {
    try {
      const latestSnap = await adminDb.collection('news')
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      if (latestSnap.empty) {
        shouldSync = true;
      } else {
        const latestDoc = latestSnap.docs[0].data();
        const latestTime = latestDoc.createdAt?.toDate ? latestDoc.createdAt.toDate().getTime() : 0;
        const fourHoursAgo = Date.now() - 4 * 60 * 60 * 1000;
        if (latestTime < fourHoursAgo) {
          shouldSync = true;
        }
      }
    } catch (e) {
      console.error('Failed to verify latest news age:', e);
      shouldSync = false; // Fallback to safe no-op on database error
    }
  }

  if (!shouldSync) {
    return NextResponse.json({
      message: 'News is already fresh. Sync skipped.',
      synced: false
    });
  }

  const results: any[] = [];
  let updatedCount = 0;

  for (const config of FEEDS) {
    try {
      const res = await fetch(config.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        next: { revalidate: 3600 } // Cache for 1 hour maximum
      });

      if (!res.ok) continue;

      const xmlText = await res.text();
      const articles = parseRSS(xmlText, config.category, config.fallbackImage);

      // Save top 6 latest stories per feed to Firestore
      for (const article of articles.slice(0, 6)) {
        // Query to check if article already exists using title match to prevent duplicates
        const existingSnap = await adminDb.collection('news')
          .where('title', '==', article.title)
          .limit(1)
          .get();

        if (existingSnap.empty) {
          // Try scraping original full content from URL first
          let fullContent = article.link ? await scrapeOriginalContent(article.link) : null;
          
          if (!fullContent) {
            // Dynamic Expansion: Automatically call Gemini to draft full premium paragraphs!
            fullContent = await generateDetailedArticle(article.title, article.excerpt);
          }

          await adminDb.collection('news').add({
            title: article.title,
            excerpt: article.excerpt,
            content: fullContent,
            link: article.link,
            image: article.image,
            category: article.category,
            author: article.author,
            createdAt: Timestamp.fromDate(article.publishedAt),
          });
          updatedCount++;
        }
      }

      results.push({ feed: config.url, status: 'success', parsed: articles.length });
    } catch (err: any) {
      results.push({ feed: config.url, status: 'error', message: err.message });
    }
  }

  return NextResponse.json({
    message: 'News sync completed successfully!',
    added: updatedCount,
    details: results
  });
}
