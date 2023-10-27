import api from "@/api/server";

export default async function MovieDetailsPage({
  params,
}: {
  params: { movieId: string };
}) {
  const movieDetails = await api.tmdbDetails.getMovie({
    movieId: params.movieId,
  });

  return (
    <main>
      <h1>{movieDetails.title}</h1>
    </main>
  );
}
