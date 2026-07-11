import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FocusCards } from "@/components/ui/focus-cards";
import { FloatingDock } from "@/components/ui/floating-dock";
import {
    IconPhoto,
    IconUsersGroup,
    IconLayoutDashboard,
    IconArrowNarrowUp,
    IconTextScanAi,
    IconCode,
    IconUserCircle
} from '@tabler/icons-react';


type Photo = {
    id: string;
    url: string;
};

const PersonGallery = () => {
    const links = [
        { title: "feed", icon: <IconPhoto className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/gallery" },
        { title: "people", icon: <IconUsersGroup className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/people" },
        { title: "collections", icon: <IconLayoutDashboard className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/albums" },
        { title: "upload", icon: <IconArrowNarrowUp className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/upload" },
        { title: "AI mode", icon: <IconTextScanAi className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/uc" },
        { title: "contribute", icon: <IconCode className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/https://github.com/pxe-photos/pxephotos" },
        { title: "user", icon: <IconUserCircle className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/profile" },
    ];


    const { personId } = useParams();

    type Card = {
        title: string;
        src: string;
    };

    const [cards, setCards] = useState<Card[]>([]);

    useEffect(() => {

        if (!personId) return;

        const fetchPhotos = async () => {

            try {

                const authToken =
                    localStorage.getItem("authToken");

                const response =
                    await fetch(

                        `http://localhost:5000/api/segregate/people/${personId}/photos`,

                        {

                            headers: {

                                Authorization:
                                    `Bearer ${authToken}`

                            }

                        }

                    );

                const photos: Photo[] =
                    await response.json();

                const gallery =
                    photos.map(photo => ({

                        title: "",

                        src: photo.url

                    }));

                setCards(gallery);

            }
            catch (err) {

                console.log(err);

            }

        };

        fetchPhotos();

    }, [personId]);

    return (

        <div className="min-h-screen bg-black">

            <div className="py-10">

                <FocusCards cards={cards} />

            </div>
            <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center h-auto w-auto">
                <FloatingDock items={links} />
            </div>

        </div>

    );

};

export default PersonGallery;
