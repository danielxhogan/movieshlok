import { RouterOutputs } from "@/api/types";

type HelloResonse = RouterOutputs["example"]["hello"];

export default function HelloServer({ data }: { data: HelloResonse }) {
  return <p className="text-secondaryfg ">{data.greeting}</p>;
}
