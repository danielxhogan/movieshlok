import Link from "next/link";

export default function TestPage() {
  return (
    <main>
      Test 1
      <div>
        <Link href="/test1">test 1</Link>
      </div>
      <div>
        <Link href="/test2">test 2</Link>
      </div>
      <div>
        <Link href="/test3">test 3</Link>
      </div>
    </main>
  );
}
