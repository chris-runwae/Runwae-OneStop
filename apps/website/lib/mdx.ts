import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type BlogFrontmatter = {
  title: string;
  description: string;
  date: string;
  author?: string;
  coverImage?: string;
  tags?: string[];
  draft?: boolean;
};

export type BlogPost = {
  slug: string;
  source: string;
  frontmatter: BlogFrontmatter;
};

export type LandingFrontmatter = {
  title: string;
  description: string;
  hero: { eyebrow?: string; headline: string; subhead?: string };
  cta?: { label: string; href: string };
  ogImage?: string;
};

export type LandingPage = {
  slug: string;
  source: string;
  frontmatter: LandingFrontmatter;
};

const ROOT = process.cwd();
const BLOG_DIR = path.join(ROOT, "content", "blog");
const LP_DIR = path.join(ROOT, "content", "lp");

async function readMdxDir(dir: string) {
  let entries: string[] = [];
  try {
    entries = await fs.readdir(dir);
  } catch {
    return [];
  }
  return entries.filter((file) => file.endsWith(".mdx"));
}

async function readMdxFile(dir: string, file: string) {
  const raw = await fs.readFile(path.join(dir, file), "utf8");
  const { content, data } = matter(raw);
  return { content, data, slug: file.replace(/\.mdx$/, "") };
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const files = await readMdxDir(BLOG_DIR);
  const posts = await Promise.all(
    files.map(async (file) => {
      const { content, data, slug } = await readMdxFile(BLOG_DIR, file);
      return {
        slug,
        source: content,
        frontmatter: data as BlogFrontmatter,
      };
    })
  );
  return posts
    .filter((post) => !post.frontmatter.draft)
    .sort((a, b) => (a.frontmatter.date < b.frontmatter.date ? 1 : -1));
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const { content, data } = await readMdxFile(BLOG_DIR, `${slug}.mdx`);
    return { slug, source: content, frontmatter: data as BlogFrontmatter };
  } catch {
    return null;
  }
}

export async function getLandingPages(): Promise<LandingPage[]> {
  const files = await readMdxDir(LP_DIR);
  return Promise.all(
    files.map(async (file) => {
      const { content, data, slug } = await readMdxFile(LP_DIR, file);
      return { slug, source: content, frontmatter: data as LandingFrontmatter };
    })
  );
}

export async function getLandingPage(
  slug: string
): Promise<LandingPage | null> {
  try {
    const { content, data } = await readMdxFile(LP_DIR, `${slug}.mdx`);
    return { slug, source: content, frontmatter: data as LandingFrontmatter };
  } catch {
    return null;
  }
}
