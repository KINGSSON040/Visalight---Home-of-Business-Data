import Link from "next/link";
import { Card } from "@/components/ui/card";
import { t } from "@/lib/content/copy";
import type { BlogPost } from "@/lib/content/types";
import { formatSwedishDate } from "@/lib/content/types";

export function BlogCard({ post, author }: { post: BlogPost; author: string }) {
  return (
    <Card>
      <p className="text-muted-foreground">
        {formatSwedishDate(post.publishedAt)} · {t("blog.by")} {author}
      </p>
      <h2 className="mt-2 text-2xl">
        <Link href={`/blogg/${post.slug}`} className="text-foreground no-underline">
          {post.title}
        </Link>
      </h2>
      <p className="mt-3">{post.excerpt}</p>
    </Card>
  );
}
