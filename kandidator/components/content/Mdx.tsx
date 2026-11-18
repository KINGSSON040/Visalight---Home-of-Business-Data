import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { isSafeHref, isSafeMdx } from "@/lib/content/mdx";
import { Prose } from "@/components/content/Prose";

function MdxLink({ href, children }: { href?: string; children?: React.ReactNode }) {
  if (!href || !isSafeHref(href)) return <span>{children}</span>;
  if (href.startsWith("/")) return <Link href={href}>{children}</Link>;
  return (
    <a href={href} rel="noopener noreferrer">
      {children}
    </a>
  );
}

const components = {
  a: MdxLink,
};

export async function MdxContent({ source }: { source: string }) {
  if (!isSafeMdx(source)) {
    if (process.env.NODE_ENV !== "production") {
      throw new Error("MDX innehåller otillåten markup.");
    }
    return <p>Innehållet kunde inte visas.</p>;
  }
  return (
    <Prose>
      <MDXRemote source={source} components={components} />
    </Prose>
  );
}
