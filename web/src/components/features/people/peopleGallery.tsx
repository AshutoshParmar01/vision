import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FocusCards } from "@/components/ui/focus-cards";
import { FloatingDock } from "@/components/ui/floating-dock";
import { navigationLinks } from "../../ui/dock-links";


type Photo = {
    id: string;
    url: string;
};

const PersonGallery = () => {
    


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
                <FloatingDock items={navigationLinks} />
            </div>

        </div>

    );

};

export default PersonGallery;
