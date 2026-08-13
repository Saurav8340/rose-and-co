import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const DIR = path.join(process.cwd(), 'content', 'journal');

export type JournalPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  cover?: string;
  keywords?: string[];
  content: string;
  html: string;
  readingTime: string;
};

function readingTime(text: string): string {
  const words = text.split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min read`;
}

export function getAllPosts(): JournalPost[] {
  if (!fs.existsSync(DIR)) return [];
  const files = fs.readdirSync(DIR).filter(f => f.endsWith('.md'));
  const posts = files.map(file => {
    const raw = fs.readFileSync(path.join(DIR, file), 'utf8');
    const { data, content } = matter(raw);
    const html = marked.parse(content, { async: false }) as string;
    return {
      slug: file.replace(/\.md$/, ''),
      title: data.title || '',
      excerpt: data.excerpt || '',
      date: data.date || new Date().toISOString().slice(0, 10),
      cover: data.cover,
      keywords: data.keywords || [],
      content,
      html,
      readingTime: readingTime(content),
    };
  });
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export function getPostBySlug(slug: string): JournalPost | null {
  const file = path.join(DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, 'utf8');
  const { data, content } = matter(raw);
  const html = marked.parse(content, { async: false }) as string;
  return {
    slug,
    title: data.title || '',
    excerpt: data.excerpt || '',
    date: data.date || new Date().toISOString().slice(0, 10),
    cover: data.cover,
    keywords: data.keywords || [],
    content,
    html,
    readingTime: readingTime(content),
  };
}




