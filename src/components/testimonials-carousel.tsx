"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    quote: "Depuis qu'on a Yallo, on ne rate plus un appel le midi. CA +20%.",
    author: "Mehdi",
    company: "Istanbul Kebab",
  },
  {
    quote: "L'IA gère mieux les accents que certains de mes extras. Bluffant.",
    author: "Sarah",
    company: "Tacos Avenue",
  },
  {
    quote: "Installation en 10 minutes, l'équipe est super réactive.",
    author: "Thomas",
    company: "Burger & Co",
  },
  {
    quote: "On a gagné 2h par jour en évitant les appels pendant le rush.",
    author: "Karim",
    company: "Pizza Express",
  },
  {
    quote: "Mes clients sont bluffés, ils pensent parler à un humain !",
    author: "Julie",
    company: "Le Petit Grec",
  },
];

export function TestimonialsCarousel() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  React.useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Calculate card state based on distance from center
  const getCardState = (index: number) => {
    const wrappedDistance = Math.min(
      Math.abs(current - index),
      Math.abs(current - index + testimonials.length),
      Math.abs(current - index - testimonials.length)
    );
    
    if (wrappedDistance === 0) return "center";
    if (wrappedDistance === 1) return "adjacent";
    return "hidden";
  };

  return (
    <div className="max-w-5xl mx-auto px-4">
      <Carousel
        setApi={setApi}
        opts={{
          align: "center",
          loop: true,
        }}
        plugins={[plugin.current]}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {testimonials.map((testimonial, index) => {
            const state = getCardState(index);
            const isCenter = state === "center";
            const isAdjacent = state === "adjacent";

            return (
              <CarouselItem
                key={index}
                className="pl-2 md:pl-4 basis-[80%] sm:basis-[60%] md:basis-1/3"
              >
                <div
                  className={cn(
                    "h-full transition-all duration-500 ease-out",
                    isCenter && "scale-100 opacity-100 z-10",
                    isAdjacent && "scale-90 opacity-40 translate-y-4 blur-[1px]",
                    !isCenter && !isAdjacent && "scale-85 opacity-20 translate-y-6 blur-[2px]"
                  )}
                >
                  <Card
                    className={cn(
                      "h-full transition-all duration-500 noise",
                      isCenter
                        ? "bg-card/50 border-[#f6cf62]/40 shadow-lg shadow-[#f6cf62]/10"
                        : "bg-card/30 border-white/5"
                    )}
                  >
                    <CardContent className="p-6">
                      <Quote
                        className={cn(
                          "w-8 h-8 mb-4 transition-colors duration-500",
                          isCenter ? "text-[#f6cf62]/60" : "text-white/10"
                        )}
                      />
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, j) => (
                          <Star
                            key={j}
                            className={cn(
                              "w-4 h-4 transition-colors duration-500",
                              isCenter
                                ? "fill-[#f6cf62] text-[#f6cf62]"
                                : "fill-white/20 text-white/20"
                            )}
                          />
                        ))}
                      </div>
                      <blockquote
                        className={cn(
                          "mb-6 leading-relaxed text-base transition-colors duration-500",
                          isCenter ? "text-white" : "text-white/60"
                        )}
                      >
                        &ldquo;{testimonial.quote}&rdquo;
                      </blockquote>
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500",
                            isCenter
                              ? "bg-[#f6cf62]/20 text-[#f6cf62]"
                              : "bg-white/5 text-white/40"
                          )}
                        >
                          {testimonial.author[0]}
                        </div>
                        <div>
                          <div
                            className={cn(
                              "font-semibold text-sm transition-colors duration-500",
                              isCenter ? "text-white" : "text-white/60"
                            )}
                          >
                            {testimonial.author}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {testimonial.company}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        
        {/* Navigation arrows - positioned better */}
        <CarouselPrevious className="-left-2 sm:-left-4 md:-left-12 bg-card/80 border-white/10 hover:bg-white/10 hover:border-[#f6cf62]/30 text-white backdrop-blur-sm" />
        <CarouselNext className="-right-2 sm:-right-4 md:-right-12 bg-card/80 border-white/10 hover:bg-white/10 hover:border-[#f6cf62]/30 text-white backdrop-blur-sm" />
      </Carousel>
      
      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-8">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              current === index
                ? "bg-[#f6cf62] w-6"
                : "bg-white/20 hover:bg-white/40 w-2"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
