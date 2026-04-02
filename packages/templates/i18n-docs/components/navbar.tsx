import LangSelect from "./lang-select";

export default function Navbar() {
  return (
    <nav className="border-b border-neutral-700 w-full h-16 mb-5 px-4">
      <span>change locale to :</span> <LangSelect />
    </nav>
  );
}
