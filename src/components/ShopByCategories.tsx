import Link from "next/link";

type CategoryTile = {
  name: string;
  href: string;
  image?: string;
};

export default function ShopByCategories({ tiles }: { tiles: CategoryTile[] }) {
  const visibleTiles = tiles.filter((tile) => tile.image);
  if (!visibleTiles.length) return null;

  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-3xl font-semibold tracking-tight text-stone-950 uppercase sm:text-4xl">
          Shop by categories
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {visibleTiles.map((tile) => (
            <Link key={tile.name} href={tile.href} className="group block">
              <article>
                <div className="aspect-[4/5] overflow-hidden bg-stone-100">
                  <img
                    src={tile.image}
                    alt={tile.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="pt-5 text-center">
                  <h3 className="text-base font-semibold tracking-[0.12em] text-stone-950 uppercase">
                    {tile.name}
                  </h3>
                  <span className="mx-auto mt-4 block h-px w-28 bg-stone-950 transition group-hover:w-36" />
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
