"use client";
import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";

type Card = {
  id: number;
  content: React.ReactNode;
  className: string;
  thumbnail: string;
  focus?: string;
};

const CardContent = ({ title, description }: { title: string; description: string }) => {
  return (
    <div>
      <p className="font-display font-semibold md:text-4xl text-xl text-white">
        {title}
      </p>
      <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
        {description}
      </p>
    </div>
  );
};

export const LayoutGrid = ({ cards }: { cards: Card[] }) => {
  const [selected, setSelected] = useState<Card | null>(null);
  const [lastSelected, setLastSelected] = useState<Card | null>(null);

  const handleClick = (card: Card) => {
    setLastSelected(selected);
    setSelected(card);
  };

  const handleOutsideClick = () => {
    setLastSelected(selected);
    setSelected(null);
  };

  return (
    <div className="w-full h-full p-10 grid grid-cols-1 md:grid-cols-3 max-w-8xl mx-auto gap-4 relative">
      {cards.map((card, i) => (
        <div key={i} className={cn(card.className, "")}>
          <motion.div
            onClick={() => handleClick(card)}
            className={cn(
              card.className,
              "relative overflow-hidden",
              selected?.id === card.id
                ? "rounded-3xl cursor-pointer absolute inset-0 h-1/2 w-full md:w-1/2 m-auto z-50 flex justify-center items-center flex-wrap flex-col"
                : lastSelected?.id === card.id
                ? "z-40 bg-white rounded-3xl h-full w-full"
                : "bg-white rounded-3xl h-full w-full"
            )}
            layoutId={`card-${card.id}`}
          >
            {selected?.id === card.id && <SelectedCard selected={selected} />}
            <ImageComponent card={card} />
          </motion.div>
        </div>
      ))}
      <motion.div
        onClick={handleOutsideClick}
        className={cn(
          "absolute h-full w-full left-0 top-0  opacity-0 z-10",
          selected?.id ? "pointer-events-auto" : "pointer-events-none"
        )}
        animate={{ opacity: selected?.id ? 0.3 : 0 }}
      />
    </div>
  );
};

const ImageComponent = ({ card }: { card: Card }) => {
  return (
    <motion.img
      layoutId={`image-${card.id}-image`}
      src={card.thumbnail}
      height="500"
      width="500"
      className={cn(
        "object-cover absolute inset-0 h-full w-full transition duration-200"
      )}
      alt="thumbnail"
      style={{ objectPosition: card.focus || "50% 50%" }}
    />
  );
};

const SelectedCard = ({ selected }: { selected: Card | null }) => {
  return (
    <div className="bg-transparent h-full w-full flex flex-col justify-end rounded-3xl shadow-2xl relative z-[60]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        className="absolute inset-0 h-full w-full bg-black opacity-60 z-10"
      />
      <motion.div
        layoutId={`content-${selected?.id}`}
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative px-8 pb-4 z-[70]"
      >
        {selected?.content}
      </motion.div>
    </div>
  );
};

export function LayoutGridDemo() {
  const [cards, setCards] = useState<Card[]>([
    {
      id: 1,
      content: <CardContent title="Portfolio" description="Loading your latest collections." />,
      className: "md:col-span-2",
      thumbnail: "/placeholder.svg",
    },
    {
      id: 2,
      content: <CardContent title="Portfolio" description="Loading your latest collections." />,
      className: "col-span-1",
      thumbnail: "/placeholder.svg",
    },
    {
      id: 3,
      content: <CardContent title="Portfolio" description="Loading your latest collections." />,
      className: "col-span-1",
      thumbnail: "/placeholder.svg",
    },
    {
      id: 4,
      content: <CardContent title="Portfolio" description="Loading your latest collections." />,
      className: "md:col-span-2",
      thumbnail: "/placeholder.svg",
    },
  ]);

  const heroCards = useMemo(() => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ""
    const baseUrl = cloudName ? `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/` : ""
    const urls = GRID_PUBLIC_IDS.map((publicId) =>
      baseUrl ? `${baseUrl}${publicId}` : "/placeholder.svg",
    )

    return urls.map((src, index) => ({
      id: index + 1,
      content: <CardContent title={`Photo ${index + 1}`} description="From your Cloudinary collection" />,
      className: index % 3 === 0 ? "md:col-span-2" : "col-span-1",
      thumbnail: src,
      focus: gridFocusPositions[index] || "50% 50%",
    }))
  }, [])

  React.useEffect(() => {
    if (heroCards.length) {
      setCards(heroCards)
    }
  }, [heroCards])

  return (
    <div className="h-screen py-20 w-full">
      <LayoutGrid cards={cards} />
    </div>
  );
}

const GRID_PUBLIC_IDS = [
  "portfolio/nyc/dsc00774-enhanced-nr",
  "portfolio/jewlewry-store/dsc08471",
  "portfolio/svm/dsc01912-enhanced-nr",
  "portfolio/svm/dsc09789",
];

const gridFocusPositions = ["50% 50%", "50% 70%", "50% 50%", "50% 70%"];
