import { buttonVariants } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export default function ErrorComp({ error }: { error: unknown }) {
  let message =
    "We're sorry, but an error occurred while processing your request.";
  if (error instanceof Error) message = error.message;
  return (
    <div className="min-h-[87vh] px-2 sm:py-28 py-36 flex flex-col gap-4 items-center w-fit mx-auto">
      <div className="text-center flex flex-col items-center justify-center w-fit gap-2">
        <h2 className="text-7xl font-bold pr-1">Oops!</h2>
        <p className="text-muted-foreground text-md font-medium">
          Something went wrong {":`("}
        </p>
        <p>{message}</p>
      </div>
      <div className="flex items-center gap-2">
        <Link to="/" className={buttonVariants({})}>
          Back to homepage
        </Link>
      </div>
    </div>
  );
}
