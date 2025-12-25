"use client";

import { motion } from "motion/react";

interface Message {
  id: number;
  speaker: "client" | "yallo";
  text: string;
}

// Messages statiques sans animation de typing pour meilleure performance
const displayedMessages: Message[] = [
  { id: 1, speaker: "yallo", text: "Bonjour ! Yallo à votre service, que puis-je vous préparer aujourd'hui ?" },
  { id: 2, speaker: "client", text: "Salut, je voudrais un kebab viande avec des frites s'il vous plaît." },
  { id: 3, speaker: "yallo", text: "Parfait ! Quelle sauce souhaitez-vous ? Nous avons blanche, harissa, algérienne..." },
];

export function ConversationStream() {
  return (
    <div className="relative h-36 overflow-hidden">
      <div className="h-full overflow-y-auto overflow-x-hidden px-1 no-scrollbar">
        <div className="space-y-2 py-2">
          {displayedMessages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
              className={`rounded-lg p-3 border backdrop-blur-sm ${
                message.speaker === "yallo"
                  ? "border-primary/20 bg-primary/5"
                  : "border-border bg-muted/50"
              }`}
            >
              <p className={`text-xs mb-1 font-medium ${
                message.speaker === "yallo" ? "text-primary" : "text-muted-foreground"
              }`}>
                {message.speaker === "yallo" ? "Yallo" : "Client"}
              </p>
              <p className={`text-sm leading-relaxed ${
                message.speaker === "yallo" ? "text-foreground" : "text-foreground/90"
              }`}>{message.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
