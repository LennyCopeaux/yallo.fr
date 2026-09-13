import { permanentRedirect } from "next/navigation";

// Les informations légales sont maintenues à un seul endroit (/legal) : deux pages
// séparées finissaient par se contredire. L'ancienne URL reste valide et redirige.
export default function MentionsLegalesPage() {
  permanentRedirect("/legal");
}
