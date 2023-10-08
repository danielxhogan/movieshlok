import { api } from "@/api/server";
import HelloClient from "@/components/HelloClient";
import Client from "@/components/Client";
import HelloServer from "@/components/HelloServer";
import HelloDB from "@/components/HelloDB";
import Head from "next/head";

export default async function Home() {
  const hello = await api.example.hello({ text: "from the server" });
  const dbData = await api.example.getAll();

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <HelloClient />
        <Client />
        <HelloServer data={hello} />
        <HelloDB data={dbData} />
      </main>
    </>
  );
}
