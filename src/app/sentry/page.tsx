"use client";

export default function SentryTestPage() {
  return (
    <div className="p-8">
      <h1>Test Sentry</h1>
      <button
        type="button"
        onClick={() => {
          throw new Error("Test erreur Sentry");
        }}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
      >
        Déclencher une erreur
      </button>
    </div>
  );
}