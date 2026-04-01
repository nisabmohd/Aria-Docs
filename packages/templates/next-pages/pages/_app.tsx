import "@/styles/globals.css";
import "@ariadocs/react/styles/github.css"; // rehypePrism should be there in plugin for syntax highlight

import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
