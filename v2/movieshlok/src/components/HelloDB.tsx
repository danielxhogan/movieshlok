import { RouterOutputs } from "@/api/types";

type HelloDBResonse = RouterOutputs["example"]["getAll"];

export default function HelloDB({ data }: { data: HelloDBResonse }) {
  return (
    <div>
      {data.map((message) => (
        <div>{message.name}</div>
      ))}
    </div>
  );
}
