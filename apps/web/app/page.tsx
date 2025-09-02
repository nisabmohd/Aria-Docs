import Link from "next/link";

export default async function Page() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">Ariadocs</h1>
      <p className="text-lg text-gray-600 mb-8">
        Ariadocs is a lightweight, React-first library for building
        documentation sites. It works seamlessly with frameworks like{" "}
        <span className="font-medium">Next.js</span>,{" "}
        <span className="font-medium">TanStack Start</span>, and{" "}
        <span className="font-medium">React Router</span>, giving you full
        control over content, styling, and rendering.
      </p>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Get started</h2>
        <ul className="space-y-2">
          <li>
            <Link
              href="/docs/getting-started/nextjs-app"
              className="text-blue-600 hover:underline"
            >
              Next.js App Router
            </Link>
          </li>
          <li>
            <Link
              href="/docs/getting-started/nextjs-pages"
              className="text-blue-600 hover:underline"
            >
              Next.js Pages Router
            </Link>
          </li>
          <li>
            <Link
              href="/docs/getting-started/react-router"
              className="text-blue-600 hover:underline"
            >
              React Router
            </Link>
          </li>
          <li>
            <Link
              href="/docs/getting-started/tanstack-start"
              className="text-blue-600 hover:underline"
            >
              TanStack Start
            </Link>
          </li>
          <li>
            <Link
              href="/docs/getting-started/whats-next"
              className="text-blue-600 hover:underline"
            >
              What's next?
            </Link>
          </li>
        </ul>
      </div>

      <p className="text-sm text-gray-500">
        🚀 Tune in for updates — new features and improvements coming soon.
      </p>
    </section>
  );
}
