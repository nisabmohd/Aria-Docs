import { CheckIcon, CopyIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";

export default function Copy({ content }: { content: string }) {
  const [isCopied, setIsCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  }

  return (
    <Button
      variant="secondary"
      className="border"
      size="icon"
      onClick={handleCopy}
    >
      {isCopied ? (
        <CheckIcon className="!w-[0.9rem] !h-[0.9rem]" />
      ) : (
        <CopyIcon className="!w-[0.8rem] !h-[0.8rem]" />
      )}
    </Button>
  );
}
