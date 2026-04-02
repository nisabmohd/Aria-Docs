import { getDictionary, LangProps } from "@/lib/i18n";

export default async function Home({ params }: LangProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return (
    <div>
      <h2>{dict.home.title}</h2>
      <p>{dict.home.description}</p>
    </div>
  );
}
