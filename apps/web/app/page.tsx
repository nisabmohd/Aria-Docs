import Link from "next/link";

export default async function Page() {
  return (
    <section className="not-prose flex min-h-[70vh] flex-col items-center justify-center text-center">
      <div className="mb-6 inline-flex items-center rounded-full border px-3 py-1 text-sm">
        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500"></span>
        Open Source
      </div>

      <div className="mb-6 inline-flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-2 font-mono text-sm">
        <span className="text-muted-foreground">$</span>
        <span>npx create-ariadocs-app my-docs</span>
      </div>

      <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
        Free Documentation
        <br />
        for Modern React
      </h1>

      <p className="mb-8 max-w-xl text-lg text-muted-foreground">
        A lightweight, React-first library for building beautiful documentation
        sites. Works with Next.js, TanStack Start, and React Router.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/docs/getting-started/quick-start"
          className="inline-flex items-center justify-center rounded-lg bg-foreground px-6 py-3 font-medium text-background transition-colors hover:bg-foreground/80"
        >
          Get Started
        </Link>
        <Link
          href="https://github.com/nisabmohd/Aria-Docs"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-lg border px-6 py-3 font-medium transition-colors hover:bg-accent"
        >
          GitHub
        </Link>
      </div>
    </section>
  );
}
