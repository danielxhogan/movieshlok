import { Spinner } from "@/components/icons";

export default function SearchLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Spinner />
    </div>
  );
}
