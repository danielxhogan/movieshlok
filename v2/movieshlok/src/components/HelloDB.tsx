import type { RouterOutputs } from "@/api/types";

type HelloDBResonse = RouterOutputs["example"]["getAll"];

export default function HelloDB({ data }: { data: HelloDBResonse }) {
  return (
    <div>
      {data.map((message) => (
        <div key={message.id}>{message.name}</div>
      ))}
    </div>
  );
}
