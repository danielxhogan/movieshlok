import Trailer from "@/components/movie/trailer";
import api from "@/api/server";
import type { Video } from "@/tmdb/details";

export default async function MovieDetailsPage({
  params,
}: {
  params: { movieId: string };
}) {
  const movieDetails = await api.tmdbDetails.getMovie({
    movieId: params.movieId,
  });

  let trailer: Video | undefined = undefined;

  for (const video of movieDetails.videos.results) {
    if (video.type === "Trailer" && video.site === "YouTube") {
      trailer = video;
      break;
    }
  }

  return (
    <main className="container mx-auto px-6">
      {trailer && <Trailer trailer={trailer} />}
    </main>
  );
}
