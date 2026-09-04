import "server-only";
import { connectToDatabase } from "@/lib/db";
import { Release, type IRelease, type ReleaseTag } from "@/lib/models/Release";
import { releases as seedReleases } from "@/data/releases";

export type { ReleaseTag };

/** Plain, serialisable release used in the UI. */
export interface ReleaseRow {
  id: string;
  date: string;
  title: string;
  tag: ReleaseTag;
  items: string[];
}

function toRow(doc: IRelease): ReleaseRow {
  return {
    id: doc._id.toString(),
    date: doc.date,
    title: doc.title,
    tag: doc.tag,
    items: doc.items ?? [],
  };
}

/**
 * All releases, newest first. On first use (empty collection) the static
 * history in `data/releases.ts` is seeded into the database once, after which
 * the database is the source of truth and can be edited from the admin.
 */
export async function listReleases(): Promise<ReleaseRow[]> {
  await connectToDatabase();
  const count = await Release.estimatedDocumentCount();
  if (count === 0 && seedReleases.length) {
    await Release.insertMany(
      seedReleases.map((r) => ({
        date: r.date,
        title: r.title,
        tag: r.tag,
        items: r.items,
      })),
    ).catch(() => {
      /* ignore races / partial seeds — the read below still returns rows */
    });
  }
  // `date` is an ISO string, so lexicographic sort is chronological.
  const docs = await Release.find({})
    .sort({ date: -1, createdAt: -1 })
    .lean<IRelease[]>();
  return docs.map(toRow);
}
