"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ArrowRight,
  Clock,
  Check,
  Bot,
  Phone,
  Mic,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { fadeInUp, staggerContainer } from "./animations";

// Conversation téléphonique prédéfinie
const phoneConversation = [
  { text: "Bienvenue chez Kebab Istanbul ! Que puis-je prendre pour vous ?", sender: 'ai' as const, delay: 2 },
  { text: "Bonjour, je voudrais un grec viande avec supplément fromage s'il vous plaît", sender: 'user' as const, delay: 4 },
  { text: "Parfait ! Un kebab viande avec supplément fromage. Voulez-vous des frites et une boisson avec ?", sender: 'ai' as const, delay: 3 },
  { text: "Oui, des frites et un Coca", sender: 'user' as const, delay: 3 },
  { text: "Excellent ! Pour 2€ de plus, les frites passent en XL. Ça vous dit ?", sender: 'ai' as const, delay: 3 },
  { text: "Oui pourquoi pas, je prends les frites XL", sender: 'user' as const, delay: 3 },
  { text: "Parfait ! Votre commande : 1 kebab viande avec fromage, frites XL et un Coca. Ça fait 14€50. C'est pour emporter ou sur place ?", sender: 'ai' as const, delay: 4 },
  { text: "Sur place", sender: 'user' as const, delay: 2 },
  { text: "Parfait ! Votre commande sera prête dans 15 minutes. À tout de suite !", sender: 'ai' as const, delay: 3 },
];

function LivePhoneConversation() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [displayedMessages, setDisplayedMessages] = useState<Array<{ text: string; sender: 'ai' | 'user'; timestamp: number; id: number }>>([]);
  const [typingText, setTypingText] = useState("");
  const [typingSender, setTypingSender] = useState<'ai' | 'user' | null>(null);
  const [typingMessageId, setTypingMessageId] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const processedMessagesRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    setElapsedSeconds(0);
    setDisplayedMessages([]);
    setTypingText("");
    setTypingSender(null);
    setTypingMessageId(null);
    processedMessagesRef.current.clear();

    intervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        const newSeconds = prev + 1;
        
        let cumulativeDelay = 0;
        for (let i = 0; i < phoneConversation.length; i++) {
          cumulativeDelay += phoneConversation[i].delay;
          
          if (newSeconds >= cumulativeDelay && !processedMessagesRef.current.has(i)) {
            processedMessagesRef.current.add(i);
            const message = phoneConversation[i];
            
            setTypingSender(message.sender);
            setTypingMessageId(i);
            let charIndex = 0;
            setTypingText("");
            
            const typeChar = () => {
              if (charIndex < message.text.length) {
                setTypingText(message.text.slice(0, charIndex + 1));
                charIndex++;
                typingTimeoutRef.current = setTimeout(typeChar, 30);
              } else {
                setDisplayedMessages((prev) => {
                  if (prev.some(m => m.id === i)) {
                    return prev;
                  }
                  return [
                    ...prev,
                    { text: message.text, sender: message.sender, timestamp: newSeconds, id: i }
                  ];
                });
                setTypingText("");
                setTypingSender(null);
                setTypingMessageId(null);
              }
            };
            typeChar();
            break;
          }
        }

        const totalDuration = phoneConversation.reduce((acc, msg) => acc + msg.delay, 0);
        if (newSeconds >= totalDuration + 3) {
          setDisplayedMessages([]);
          setTypingText("");
          setTypingSender(null);
          setTypingMessageId(null);
          processedMessagesRef.current.clear();
          return 0;
        }
        
        return newSeconds;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative glass-strong rounded-[2.5rem] p-2 border-border">
      <div className="bg-background rounded-[2rem] overflow-hidden border border-border">
        <div className="bg-card/80 px-5 py-3 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">Yallo IA</div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-emerald-500">En appel • {formatTime(elapsedSeconds)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
              <Phone className="w-4 h-4 text-red-500" />
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3 min-h-[320px] max-h-[400px] overflow-y-auto">
          {displayedMessages.map((msg) => (
            <motion.div
              key={`msg-${msg.id}-${msg.timestamp}`}
              initial={{ opacity: 0, x: msg.sender === 'ai' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
              )}
              <div className={`rounded-2xl px-4 py-2.5 border max-w-[85%] ${
                msg.sender === 'ai' 
                  ? 'bg-card/50 rounded-tl-sm border-border' 
                  : 'bg-primary/10 rounded-tr-sm border-primary/20'
              }`}>
                <p className="text-sm text-foreground">
                  {msg.sender === 'user' && '"'}
                  {msg.text}
                  {msg.sender === 'user' && '"'}
                </p>
                {msg.sender === 'ai' && msg.text.includes('XL') && (
                  <Badge className="mt-2 bg-primary/10 text-primary border-primary/20 text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Upsell
                  </Badge>
                )}
              </div>
            </motion.div>
          ))}
          
          {typingText && typingSender && typingMessageId !== null && !displayedMessages.some(m => m.id === typingMessageId) && (
            <motion.div
              initial={{ opacity: 0, x: typingSender === 'ai' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex gap-2 ${typingSender === 'user' ? 'justify-end' : ''}`}
            >
              {typingSender === 'ai' && (
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
              )}
              <div className={`rounded-2xl px-4 py-2.5 border max-w-[85%] ${
                typingSender === 'ai' 
                  ? 'bg-card/50 rounded-tl-sm border-border' 
                  : 'bg-primary/10 rounded-tr-sm border-primary/20'
              }`}>
                <p className="text-sm text-foreground">
                  {typingSender === 'user' && '"'}
                  {typingText}
                  {typingSender === 'user' && '"'}
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: 9999, repeatType: "loop" }}
                    className="ml-1"
                  >
                    |
                  </motion.span>
                </p>
              </div>
            </motion.div>
          )}
        </div>

        <div className="px-4 pb-4">
          <div className="bg-card/50 rounded-xl p-3 border border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Mic className="w-5 h-5 text-black" />
            </div>
            <div className="flex-1 flex items-center gap-0.5 h-8">
              {[12, 20, 8, 24, 16, 28, 10, 22, 14, 26, 18, 12, 24, 16, 20, 8, 22, 14, 26, 18].map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 bg-primary/60 rounded-full"
                  animate={{
                    height: [`${h}px`, `${h + 10}px`, `${Math.max(h - 6, 6)}px`, `${h}px`],
                  }}
                  transition={{
                    duration: 0.6 + (i % 3) * 0.2,
                    repeat: 9999,
                    repeatType: "loop",
                    delay: i * 0.05,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative container mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-32">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 blur-[150px] opacity-50 pointer-events-none" />

      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center relative">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="text-center lg:text-left"
        >
          <motion.div 
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-6 px-4 py-1.5 text-sm bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              IA vocale pour la restauration rapide
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-[1.1] tracking-tight"
          >
            <span className="text-foreground">Votre prise de</span>{" "}
            <span className="gradient-text-hero">commande</span>{" "}
            <span className="text-foreground">automatisée</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
          >
            L&apos;IA vocale qui prend les commandes de votre{" "}
            <span className="text-foreground font-medium">Fast Food</span> par
            téléphone. Disponible{" "}
            <span className="text-primary font-semibold">24/7</span>, sans
            accent, sans attente.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            <Link href="/contact?subject=installation">
              <Button
                size="lg"
                className="text-base sm:text-lg px-8 h-14 bg-primary text-black hover:bg-primary/90 btn-shine font-semibold glow-yellow-subtle"
              >
                Obtenir mon accès
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button
                size="lg"
                variant="outline"
                className="text-base sm:text-lg px-8 h-14 border-border hover:border-primary/50 hover:bg-accent"
              >
                Essayer la démo
              </Button>
            </Link>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 flex flex-wrap gap-8 justify-center lg:justify-start"
          >
            {[
              { value: "98%", label: "Précision" },
              { value: "<2s", label: "Temps de réponse" },
              { value: "24/7", label: "Disponibilité" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative"
        >
          <div className="relative mx-auto max-w-md lg:max-w-none">
            <div className="absolute inset-0 bg-primary/30 blur-[100px] scale-90 opacity-40" />
            <LivePhoneConversation />

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: 9999, repeatType: "loop", ease: "easeInOut" }}
              className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 glass rounded-xl p-3 border-border"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-xs font-medium text-foreground">Réponse</div>
                  <div className="text-xs text-primary font-bold">&lt; 2 secondes</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 5, repeat: 9999, repeatType: "loop", ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 glass rounded-xl p-3 border-border"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <div className="text-xs font-medium text-foreground">Commande #2851</div>
                  <div className="text-xs text-emerald-500">Envoyée en cuisine</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
