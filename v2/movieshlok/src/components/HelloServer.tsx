import { RouterOutputs } from "@/api/types";

type HelloResonse = RouterOutputs["example"]["hello"];

export default function HelloServer({ data }: { data: HelloResonse }) {
  return <section>{data.greeting}</section>;
}
