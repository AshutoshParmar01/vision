import { Hammer, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button";

const UnderConstruction = () => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6">

            <Card className="w-full max-w-xl border-neutral-800 bg-neutral-950 shadow-2xl">

                <CardContent className="flex flex-col items-center gap-6 py-14 text-center">

                    <div className="rounded-full border border-neutral-700 bg-neutral-900 p-5">

                        <Hammer className="h-10 w-10 text-neutral-200" />

                    </div>

                    <Badge
                        variant="secondary"
                        className="gap-2 rounded-full px-4 py-1"
                    >
                        <Sparkles className="h-3.5 w-3.5" />
                        Feature Preview
                    </Badge>

                    <div className="space-y-3">

                        <h1 className="text-4xl font-bold tracking-tight">

                            Under Construction

                        </h1>

                        <p className="mx-auto max-w-md text-sm leading-7 text-muted-foreground">

                            This feature is currently being built and will
                            be available in a future update. The backend is
                            ready, the frontend is catching up. Such is the
                            timeless tradition of software engineering.

                        </p>

                    </div>

                    <Button
                        variant="outline"
                        onClick={() => window.history.back()}
                    >
                        Go Back
                    </Button>

                </CardContent>

            </Card>

        </div>
    );
};

export default UnderConstruction;
