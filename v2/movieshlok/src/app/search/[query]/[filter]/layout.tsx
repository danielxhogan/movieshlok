export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mt-10 flex flex-col px-4 sm:container sm:mx-auto sm:px-7 md:flex-row md:justify-center md:gap-6">
      <Filter />
      <div className="flex justify-center md:w-4/5 lg:w-2/3">{children}</div>
    </div>
  );
}

function Filter() {
  return (
    <aside className="font-Audiowide border-shadow mb-5 h-fit rounded border p-4 md:order-2 md:mt-16">
      <p className="mb-2 text-sm underline">Show results for</p>
      <ul className="flex flex-row flex-wrap gap-4 md:flex-col md:justify-start md:gap-0">
        <FilterItem>Movie</FilterItem>
        <FilterItem>Person</FilterItem>
      </ul>
    </aside>
  );
}

function FilterItem({ children }: { children: string }) {
  return (
    <li className="hover:bg-shadow hover:text-primarybg rounded p-1 transition-all md:w-36">
      {children}
    </li>
  );
}
