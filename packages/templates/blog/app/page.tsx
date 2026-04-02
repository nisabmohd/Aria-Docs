import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h2>Hi I'm Nisab</h2>
      <Link className="underline" href="/blog">
        Read my blog
      </Link>
    </div>
  );
}
