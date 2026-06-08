'use client'

import { Button } from "@/components/ui/button";

import { PlusIcon } from "lucide-react";

export function StudioUploadModal() {
    return <Button className="" variant={'secondary'}>
        <PlusIcon />
        Create
    </Button>
}