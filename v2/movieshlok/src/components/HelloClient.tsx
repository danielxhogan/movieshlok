"use client";

import { api } from "@/api/client";

export default function HelloClient() {
  const { data } = api.example.hello.useQuery({ text: "from the client" });
  return <div>{data?.greeting}</div>;
}
