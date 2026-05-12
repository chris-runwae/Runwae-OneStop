import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import Link from "next/link";
import Image from "next/image";

export const mdxComponents: MDXRemoteProps["components"] = {
  h1: (props) => (
    <h1
      {...props}
      className="mt-10 font-display text-4xl font-semibold tracking-tight text-foreground"
    />
  ),
  h2: (props) => (
    <h2
      {...props}
      className="mt-10 font-display text-3xl font-semibold tracking-tight text-foreground"
    />
  ),
  h3: (props) => (
    <h3
      {...props}
      className="mt-8 font-display text-2xl font-semibold tracking-tight text-foreground"
    />
  ),
  p: (props) => (
    <p {...props} className="mt-5 text-base leading-7 text-foreground/85" />
  ),
  ul: (props) => (
    <ul {...props} className="mt-5 list-disc space-y-2 pl-6 text-foreground/85" />
  ),
  ol: (props) => (
    <ol
      {...props}
      className="mt-5 list-decimal space-y-2 pl-6 text-foreground/85"
    />
  ),
  blockquote: (props) => (
    <blockquote
      {...props}
      className="mt-6 border-l-2 border-primary/40 pl-4 italic text-muted-foreground"
    />
  ),
  code: (props) => (
    <code
      {...props}
      className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]"
    />
  ),
  pre: (props) => (
    <pre
      {...props}
      className="mt-6 overflow-x-auto rounded-xl border border-border bg-muted p-4 text-sm"
    />
  ),
  a: ({ href = "", ...props }) => {
    const isExternal = /^https?:\/\//.test(href);
    if (isExternal) {
      return (
        <a
          {...props}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-primary underline-offset-4 hover:underline"
        />
      );
    }
    return (
      <Link
        href={href}
        className="text-primary underline-offset-4 hover:underline"
      >
        {props.children}
      </Link>
    );
  },
  img: ({ src = "", alt = "" }) => (
    <Image
      src={typeof src === "string" ? src : ""}
      alt={alt}
      width={1200}
      height={675}
      className="mt-6 rounded-xl border border-border"
    />
  ),
};
