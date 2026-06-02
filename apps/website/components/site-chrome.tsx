import { readFragment } from "@/lib/static-html";

export async function SiteChrome({ children }: { children: React.ReactNode }) {
  const [header, footer] = await Promise.all([
    readFragment("_header.html"),
    readFragment("_footer.html"),
  ]);
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: header }} />
      <main className="page">{children}</main>
      <div dangerouslySetInnerHTML={{ __html: footer }} />
    </>
  );
}
