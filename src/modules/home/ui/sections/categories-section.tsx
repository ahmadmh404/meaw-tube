"use client";

import { FilterCarousel } from "@/components/filter-carousel";
import { useTRPC } from "@/trpc/trpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

interface Props {
  categoryId?: string;
}

export function CategoriesSection({ categoryId }: Props) {
  return (
    <Suspense
      fallback={<FilterCarousel isLoading data={[]} onSelect={() => {}} />}>
      <ErrorBoundary errorComponent={undefined}>
        <SuspendedCategoriesSection categoryId={categoryId} />
      </ErrorBoundary>
    </Suspense>
  );
}

function SuspendedCategoriesSection({ categoryId }: Props) {
  const trpc = useTRPC();
  const { data: categories, isLoading } = useSuspenseQuery(
    trpc.categories.getMany.queryOptions(),
  );
  const router = useRouter();

  const onSelect = (value: string | null) => {
    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.set("categoryId", value);
    } else {
      url.searchParams.delete("categoryId");
    }

    router.push(url.toString());
  };

  return (
    <FilterCarousel
      value={categoryId ?? null}
      data={categories.map((cat) => ({ label: cat.name, value: cat.id }))}
      isLoading={isLoading}
      onSelect={onSelect}
    />
  );
}
