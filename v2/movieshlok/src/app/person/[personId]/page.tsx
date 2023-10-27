import api from "@/api/server";

export default async function PersonDetailsPage({
  params,
}: {
  params: { personId: string };
}) {
  const personDetails = await api.tmdbDetails.getPerson({
    personId: params.personId,
  });

  return (
    <main>
      <h1>{personDetails.name}</h1>
    </main>
  );
}
