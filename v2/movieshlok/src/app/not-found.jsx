import Image from "next/image";

export default function NotFound() {
  return (
    <main className="container mx-auto mt-7 p-7">
      <div className="shadow-shadow bg-primarybg relative rounded p-6 shadow-2xl">
        <h1 className=" font-Audiowide text-invertedfg absolute top-4 w-full text-center text-3xl sm:top-3 sm:text-5xl md:text-7xl">
          404
        </h1>
        <Image
          src="/404.jpg"
          alt="404 Not Found"
          width={854}
          height={316}
          className="w-full"
        />
        <div className="text-invertedfg font-Audiowide absolute bottom-4 w-full text-center text-xl sm:text-3xl md:text-5xl">
          <h2>I think you're lost</h2>
        </div>
      </div>
    </main>
  );
}
