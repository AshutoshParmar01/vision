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

type Person = {
    id: string;
    avatar_url: string;
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

    const [people, setPeople] = useState<Person[]>([]);

    useEffect(() => {

        const fetchPeople = async () => {

            try {

                const authToken =
                    localStorage.getItem("authToken");

                const response =
                    await fetch(
                        "http://localhost:5000/api/avatars/people",
                        {
                            headers: {
                                Authorization: `Bearer ${authToken}`
                            }
                        }
                    );

                const data =
                    await response.json();

                setPeople(data);

            } catch (err) {

                console.log(err);

            }

        };

        fetchPeople();

    }, []);

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

                                onClick={() =>
                                    navigate(`/people/${person.id}`)
                                }

                                className="cursor-pointer group flex flex-col items-center"

                            >

                                <img

                                    src={person.avatar_url}

                                    alt="avatar"

                                    className="
                                    w-36
                                    h-36
                                    rounded-full
                                    object-cover
                                    border-4
                                    border-white
                                    shadow-2xl
                                    transition
                                    duration-300
                                    group-hover:scale-110
                                    group-hover:border-violet-400
                                    "

                                />

                                <div
                                    className="
                                    mt-4
                                    text-neutral-300
                                    text-sm
                                    opacity-0
                                    group-hover:opacity-100
                                    transition
                                    "
                                >

                                    Open Gallery →

                                </div>

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
