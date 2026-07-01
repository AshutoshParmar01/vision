"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import { FocusCards } from "@/components/ui/focus-cards";

interface BackendPhoto {
  id: string;
  url: string;
}

interface FocusCard {
  title: string;
  src: string;
}

export function FocusCardsDemo() {

  const [cards, setCards] = useState<FocusCard[]>([]);

  useEffect(() => {

    fetchPhotos();

  }, []);

  async function fetchPhotos() {

    try {

      const authToken = localStorage.getItem("authToken");

      const response = await axios.get(

        "http://localhost:5000/api/photo/feed",

        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }

      );

      const photos: BackendPhoto[] = response.data;

      const convertedCards: FocusCard[] = photos.map((photo, index) => ({

        title: `Photo ${index + 1}`,

        src: photo.url,

      }));

      setCards(convertedCards);

    } catch (err) {

      console.error(err);

    }

  }

  return <FocusCards cards={cards} />;

}