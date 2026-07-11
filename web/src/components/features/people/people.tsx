import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FloatingDock } from "@/components/ui/floating-dock";
import {
    IconPhoto,
    IconUsersGroup,
    IconLayoutDashboard,
    IconArrowNarrowUp,
    IconTextScanAi,
    IconCode,
    IconUserCircle
} from "@tabler/icons-react";

type Person = {
    id: string;
    avatar_url: string;
    name?: string;
};

const People = () => {

    const navigate = useNavigate();

    const [people, setPeople] = useState<Person[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState("");

    const links = [
        { title: "feed", icon: <IconPhoto className="h-full w-full" />, href: "/gallery" },
        { title: "people", icon: <IconUsersGroup className="h-full w-full" />, href: "/people" },
        { title: "collections", icon: <IconLayoutDashboard className="h-full w-full" />, href: "/albums" },
        { title: "upload", icon: <IconArrowNarrowUp className="h-full w-full" />, href: "/upload" },
        { title: "AI mode", icon: <IconTextScanAi className="h-full w-full" />, href: "/uc" },
        { title: "contribute", icon: <IconCode className="h-full w-full" />, href: "https://github.com/pxe-photos/pxephotos" },
        { title: "user", icon: <IconUserCircle className="h-full w-full" />, href: "/profile" },
    ];

    const fetchPeople = async () => {

        try {

            const token = localStorage.getItem("authToken");

            const response = await fetch(
                "http://localhost:5000/api/avatars/people",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            setPeople(data);

        } catch (err) {

            console.log(err);

        }

    };

    useEffect(() => {

        fetchPeople();

    }, []);

    const saveName = async (personId: string) => {

        try {

            const token = localStorage.getItem("authToken");

            await fetch(

                `http://localhost:5000/api/avatars/people/${personId}`,

                {

                    method: "PUT",

                    headers: {

                        "Content-Type": "application/json",

                        Authorization: `Bearer ${token}`

                    },

                    body: JSON.stringify({

                        name

                    })

                }

            );

            setEditingId(null);

            setName("");

            fetchPeople();

        } catch (err) {

            console.log(err);

        }

    };

    return (

        <div className="min-h-screen bg-black text-white">

            <div className="max-w-7xl mx-auto px-8 py-10">

                <h1 className="text-5xl font-bold">
                    People
                </h1>

                <p className="mt-2 mb-12 text-neutral-400">
                    Automatically grouped using AI
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10">

                    {people.map((person) => (

                        <div
                            key={person.id}
                            className="flex flex-col items-center"
                        >

                            <img

                                src={person.avatar_url}

                                alt="avatar"

                                onClick={() =>
                                    navigate(`/people/${person.id}`)
                                }

                                className="
                                    w-36
                                    h-36
                                    rounded-full
                                    object-cover
                                    border-4
                                    border-white
                                    shadow-xl
                                    cursor-pointer
                                    transition
                                    duration-300
                                    hover:scale-105
                                    hover:border-violet-500
                                "

                            />

                            {

                                editingId === person.id ?

                                    <div className="mt-4 w-full space-y-2">

                                        <input

                                            value={name}

                                            onChange={(e) =>
                                                setName(e.target.value)
                                            }

                                            placeholder="Person name"

                                            className="
                                                w-full
                                                rounded-lg
                                                border
                                                border-neutral-700
                                                bg-neutral-900
                                                px-3
                                                py-2
                                                text-sm
                                                outline-none
                                                focus:border-violet-500
                                            "

                                        />

                                        <button

                                            onClick={() =>
                                                saveName(person.id)
                                            }

                                            className="
                                                w-full
                                                rounded-lg
                                                bg-violet-600
                                                py-2
                                                text-sm
                                                transition
                                                hover:bg-violet-500
                                            "

                                        >

                                            Save

                                        </button>

                                    </div>

                                    :

                                    <>

                                        <p className="mt-4 font-medium">

                                            {person.name || "Unnamed Person"}

                                        </p>

                                        <button

                                            onClick={() => {

                                                setEditingId(person.id);

                                                setName(person.name || "");

                                            }}

                                            className="
                                                text-sm
                                                text-violet-400
                                                hover:text-violet-300
                                            "

                                        >

                                            Edit

                                        </button>

                                    </>

                            }

                        </div>

                    ))}

                </div>

            </div>

            <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50">

                <FloatingDock items={links} />

            </div>

        </div>

    );

};

export default People;
