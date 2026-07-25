"use client";

import { FormEvent, SubmitEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { SearchIcon, XIcon } from "lucide-react";
import { APP_URL } from "@/constants";
import { Button } from "@/components/ui/button";

export function SearchInput() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearch(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const url = new URL(
      "/search",
      APP_URL ? `https://${APP_URL}` : "http://localhost:3000",
    );
    const newQuery = query.trim();

    url.searchParams.set("query", newQuery);

    if (!newQuery) {
      url.searchParams.delete("query");
    }

    setQuery(newQuery);
    router.push(url.toString());
  }

  return (
    <form className="flex w-full max-w-150" onSubmit={handleSearch}>
      <div className="relative  w-full">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value ?? "")}
          placeholder="Search"
          className="w-full pl-4 py-2 pr-12 rounded-l-full border focus:outline-none focus:border-blue-500"
        />

        {query && (
          <Button
            variant={"ghost"}
            size={"icon"}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full">
            <XIcon className="text-gray-500" />
          </Button>
        )}
      </div>

      {/* TODO: Add remove search button */}
      <button
        type="submit"
        disabled={!query.trim()}
        className="px-5 py-2.5 bg-gray-100 border border-l-0 rounded-r-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
        <SearchIcon className="size-5" />
      </button>
    </form>
  );
}
