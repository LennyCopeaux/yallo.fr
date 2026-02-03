import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackToHomeLink() {
  return (
    <Link href="/">
      <Button
        variant="ghost"
        size="sm"
        className="mb-6 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour à l&apos;accueil
      </Button>
    </Link>
  );
}

