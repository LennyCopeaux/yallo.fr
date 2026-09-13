/**
 * Sonnerie de nouvelle commande.
 *
 * Le son est synthetise avec la Web Audio API plutot que charge depuis un
 * fichier : rien a telecharger, donc la sonnerie fonctionne meme sur une
 * tablette de cuisine avec une connexion instable.
 *
 * Les navigateurs bloquent l'audio tant que l'utilisateur n'a pas interagi avec
 * la page : le contexte demarre alors en `suspended` et il faut appeler
 * `unlockOrderChime()` depuis un gestionnaire de clic.
 */

type AudioContextConstructor = new () => AudioContext;

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof globalThis.window === "undefined") return null;

  const Ctor =
    globalThis.window.AudioContext ??
    (globalThis.window as unknown as { webkitAudioContext?: AudioContextConstructor })
      .webkitAudioContext;

  if (!Ctor) return null;

  audioContext ??= new Ctor();
  return audioContext;
}

export function isOrderChimeBlocked(): boolean {
  const context = getAudioContext();
  if (!context) return false;
  return context.state === "suspended";
}

/** À appeler depuis un clic utilisateur pour lever le blocage navigateur. */
export async function unlockOrderChime(): Promise<boolean> {
  const context = getAudioContext();
  if (!context) return false;

  if (context.state === "suspended") {
    try {
      await context.resume();
    } catch {
      return false;
    }
  }

  return context.state === "running";
}

function playTone(
  context: AudioContext,
  frequency: number,
  startAt: number,
  duration: number
): void {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;

  // Enveloppe attaque/decroissance : evite le "clic" d'un demarrage brutal.
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(0.35, startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.05);
}

/**
 * Joue un carillon deux tons, repete une fois : assez present pour être entendu
 * dans une cuisine, assez court pour ne pas gêner.
 * Renvoie `false` si le navigateur bloque encore l'audio.
 */
export function playOrderChime(): boolean {
  const context = getAudioContext();
  if (!context || context.state !== "running") return false;

  const now = context.currentTime;

  playTone(context, 987.77, now, 0.18);
  playTone(context, 1318.51, now + 0.16, 0.28);
  playTone(context, 987.77, now + 0.5, 0.18);
  playTone(context, 1318.51, now + 0.66, 0.32);

  return true;
}
