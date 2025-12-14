"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  id: number;
  speaker: "client" | "yallo";
  text: string;
}

interface DisplayedMessage extends Message {
  displayedText: string;
  uniqueId: string;
}

const conversation: Message[] = [
  { id: 1, speaker: "yallo", text: "Bonjour ! Yallo à votre service, que puis-je vous préparer aujourd'hui ?" },
  { id: 2, speaker: "client", text: "Salut, je voudrais un kebab viande avec des frites s'il vous plaît." },
  { id: 3, speaker: "yallo", text: "Parfait ! Quelle sauce souhaitez-vous ? Nous avons blanche, harissa, algérienne..." },
  { id: 4, speaker: "client", text: "Blanche et harissa, merci." },
  { id: 5, speaker: "yallo", text: "Très bien ! Une boisson pour accompagner ?" },
  { id: 6, speaker: "client", text: "Oui, un Coca-Cola." },
  { id: 7, speaker: "yallo", text: "Parfait ! Votre commande : 1 kebab viande avec sauce blanche et harissa, 1 frites et 1 Coca-Cola. Total : 14€. C'est bien ça ?" },
  { id: 8, speaker: "client", text: "Oui c'est bon, merci !" },
];

export function ConversationStream() {
  const [messages, setMessages] = useState<DisplayedMessage[]>([]);
  const [typingMessage, setTypingMessage] = useState<Message | null>(null);
  const [typingText, setTypingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const messageIndexRef = useRef(0);
  const idCounterRef = useRef(0);

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, []);

  const generateUniqueId = useCallback(() => {
    idCounterRef.current += 1;
    return `msg-${idCounterRef.current}-${Date.now()}`;
  }, []);

  const typeMessage = useCallback((message: Message) => {
    setTypingMessage(message);
    setTypingText("");
    setIsTyping(true);
    
    let charIndex = 0;
    const text = message.text;
    
    const typeChar = () => {
      if (charIndex < text.length) {
        setTypingText(text.substring(0, charIndex + 1));
        charIndex++;
        setTimeout(typeChar, 25);
      } else {
        setTimeout(() => {
          setMessages(prev => {
            const newMessage: DisplayedMessage = {
              ...message,
              displayedText: text,
              uniqueId: generateUniqueId(),
            };
            const updated = [...prev, newMessage];
            return updated.slice(-3);
          });
          setTypingMessage(null);
          setTypingText("");
          setIsTyping(false);
        }, 100);
      }
    };
    
    typeChar();
  }, [generateUniqueId]);

  const startNextMessage = useCallback(() => {
    if (messageIndexRef.current >= conversation.length) {
      setTimeout(() => {
        setMessages([]);
        messageIndexRef.current = 0;
        idCounterRef.current = 0;
        startNextMessage();
      }, 2000);
      return;
    }
    
    const message = conversation[messageIndexRef.current];
    messageIndexRef.current += 1;
    typeMessage(message);
  }, [typeMessage]);

  useEffect(() => {
    const timer = setTimeout(startNextMessage, 500);
    return () => clearTimeout(timer);
  }, [startNextMessage]);

  useEffect(() => {
    if (!isTyping && messages.length > 0) {
      const timer = setTimeout(startNextMessage, 2500);
      return () => clearTimeout(timer);
    }
  }, [isTyping, messages.length, startNextMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingText, scrollToBottom]);

  return (
    <div className="relative h-36 overflow-hidden">
      <div 
        ref={containerRef}
        className="h-full overflow-y-auto overflow-x-hidden px-1 no-scrollbar"
      >
        <div className="space-y-2 py-2">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.uniqueId}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ 
                  type: "spring",
                  stiffness: 500,
                  damping: 40,
                  mass: 1
                }}
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
                }`}>{message.displayedText}</p>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {typingMessage && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 500,
                damping: 40
              }}
              className={`rounded-lg p-3 border backdrop-blur-sm ${
                typingMessage.speaker === "yallo"
                  ? "border-primary/20 bg-primary/5"
                  : "border-border bg-muted/50"
              }`}
            >
              <p className={`text-xs mb-1 font-medium ${
                typingMessage.speaker === "yallo" ? "text-primary" : "text-muted-foreground"
              }`}>
                {typingMessage.speaker === "yallo" ? "Yallo" : "Client"}
              </p>
              <p className={`text-sm leading-relaxed min-h-[1.25rem] ${
                typingMessage.speaker === "yallo" ? "text-foreground" : "text-foreground/90"
              }`}>
                {typingText}
                <motion.span 
                  className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-middle"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                />
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
