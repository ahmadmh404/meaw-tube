'use client'


import {
    Carousel,
    CarouselApi,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";

interface Props {
    value?: string | null;
    isLoading?: boolean;
    onSelect: (value: string | null) => void;
    data: { value: string, label: string }[]
}

export function FilterCarousel({ data, value, onSelect, isLoading }: Props) {

    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!api) {
            return;
        }

        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap() + 1);

        api.on('select', () => {
            setCurrent(api.selectedScrollSnap() + 1)
        })
    }, [api])

    return <div className="relative w-full">
        {/* Left Fade */}
        <div className={cn("absolute left-12 -bottom-2 size-12 bg-linear-to-r from-white to-transparent z-10 pointer-events-none",
            current === 1 && "hidden"
        )} />

        <Carousel
            className="w-full px-12"
            setApi={setApi}
            opts={{
                align: 'start', dragFree: true,
            }}
        >
            <CarouselContent className="-ml-3">
                {!isLoading && (
                    <CarouselItem className="pl-3 basis-auto"
                        onClick={() => onSelect(null)}
                    >
                        <Badge className="rounded-lg px-3 py-3 shadow-sm text-sm cursor-pointer whitespace-normal" variant={value == null ? "default" : "secondary"}>
                            All
                        </Badge>
                    </CarouselItem>
                )}

                {isLoading && (
                    Array.from({ length: 14 }).map((_, index) => (
                        <CarouselItem key={index}>
                            <Skeleton className="px-3 py-1 rounded-lg h-full text-sm w-25 font-semibold">
                                &sbsp;
                            </Skeleton>
                        </CarouselItem>
                    ))
                )}

                {!isLoading && data.map((category) => (
                    <CarouselItem
                        key={category.value}
                        className="pl-3 basis-auto"
                        onClick={() => onSelect(category.value)}
                    >
                        <Badge className="rounded-lg px-3 py-3 shadow-sm text-sm cursor-pointer whitespace-normal" variant={value == category.value ? "default" : "secondary"}>
                            {category.label}
                        </Badge>
                    </CarouselItem>
                ))}



            </CarouselContent>
            <CarouselPrevious className="left-0 z-20" />
            <CarouselNext className="right-0 z-20" />

            {/* Right Fade */}
            <div className={cn("absolute right-12 -bottom-2 size-12 bg-linear-to-l from-white to-transparent pointer-events-none z-10",
                current === count && "hidden"
            )} />

        </Carousel>
    </div>
}