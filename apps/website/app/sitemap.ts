import type { MetadataRoute } from "next";
import { getBlogPosts, getLandingPages } from "@/lib/mdx";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site.url;
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/hosts`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/partners`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];
  const [posts, lps] = await Promise.all([getBlogPosts(), getLandingPages()]);
  const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.frontmatter.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));
  const lpRoutes: MetadataRoute.Sitemap = lps.map((lp) => ({
    url: `${base}/lp/${lp.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
  }));
  return [...staticRoutes, ...blogRoutes, ...lpRoutes];
}
