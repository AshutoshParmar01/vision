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
} from '@tabler/icons-react';
import { div } from "three/src/nodes/math/OperatorNode.js";

type Person = {
    id: string;
    avatar_url: string;
    name?: string;
};

const People = () => {
    const links = [
        { title: "feed", icon: <IconPhoto className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/gallery" },
        { title: "people", icon: <IconUsersGroup className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/people" },
        { title: "collections", icon: <IconLayoutDashboard className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/uc" },
        { title: "upload", icon: <IconArrowNarrowUp className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/upload" },
        { title: "AI mode", icon: <IconTextScanAi className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/uc" },
        { title: "contribute", icon: <IconCode className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/https://github.com/pxe-photos/pxephotos" },
        { title: "user", icon: <IconUserCircle className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/profile" },
    ];

    const navigate = useNavigate();

    const [people, setPeople] =
        useState<Person[]>([]);

    const [editingId, setEditingId] =
        useState<string | null>(null);

    const [name, setName] =
        useState("");

    const fetchPeople = async () => {

        try {

            const authToken =
                localStorage.getItem("authToken");

            const response =
                await fetch(

                    "http://localhost:5000/api/avatars/people",

                    {

                        headers: {

                            Authorization:
                                `Bearer ${authToken}`

                        }

                    }

                );

            const data =
                await response.json();

            setPeople(data);

        }
        catch (err) {

            console.log(err);

        }

    };

    useEffect(() => {

        fetchPeople();

    }, []);

    const writeName = (person: Person) => {
        if (person.name) {
            return person.name
        } else {
            return <div>
                <form id="nameForm">
                    <input type="text" id="nameInput" required></input>
                    <button type="submit">Submit</button>
                </form>
            </div>
        }
    }

    return (

        <div className="min-h-screen bg-black text-white">

            <div className="max-w-7xl mx-auto px-8 py-10">

                <h1 className="text-5xl font-bold mb-2">
                    People
                </h1>

                <p className="text-neutral-400 mb-12">
                    Automatically grouped using AI
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10">

                    {

                        people.map((person) => (

                            <div
                                key={person.id}
                                className="flex flex-col items-center gap-3"
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
                shadow-2xl
                cursor-pointer
                transition
                duration-300
                hover:scale-105
                hover:border-violet-400
            "

                                />

                                {

                                    editingId === person.id ?

                                        <div className="flex flex-col gap-2 w-full">

                                            <input

                                                value={name}

                                                onChange={(e) =>
                                                    setName(e.target.value)
                                                }

                                                className="
                        rounded-lg
                        bg-neutral-900
                        border
                        border-neutral-700
                        px-3
                        py-2
                        text-sm
                        text-white
                        outline-none
                    "

                                                placeholder="Enter name"

                                            />

                                            <button

                                                className="
                        rounded-lg
                        bg-violet-600
                        py-2
                        text-sm
                        hover:bg-violet-500
                    "

                                                onClick={async () => {

                                                    const token =
                                                        localStorage.getItem("authToken");

                                                    await fetch(

                                                        `http://localhost:5000/api/avatars/people/${person.id}`,

                                                        {

                                                            method: "PUT",

                                                            headers: {

                                                                "Content-Type":
                                                                    "application/json",

                                                                Authorization:
                                                                    `Bearer ${token}`

                                                            },

                                                            body: JSON.stringify({

                                                                name

                                                            })

                                                        }

                                                    );

                                                    setEditingId(null);

                                                    fetchPeople();

                                                }}

                                            >

                                                Save

                                            </button>

                                        </div>

                                        :

                                        <>

                                            <p className="text-sm text-neutral-300">

                                                {person.name ?? "Unnamed Person"}

                                            </p>

                                            <button

                                                className="
                        text-xs
                        text-violet-400
                        hover:text-violet-300
                    "

                                                onClick={() => {

                                                    setEditingId(person.id);

                                                    setName(person.name ?? "");

                                                }}

                                            >

                                                Edit

                                            </button>

                                        </>

                                }

                            </div>

                        ))

                    }

                </div>

            </div>
            <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center h-auto w-auto">
                <FloatingDock items={links} />
            </div>
        </div>

    );

};

export default People;
