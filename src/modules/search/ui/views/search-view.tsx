import { CategoriesSection } from "../sections/categories-section";
import { ResultsSection } from "../sections/results-section";

interface SearchViewProps {
  query?: string;
  categoryId?: string;
}

export function SearchView({ categoryId, query }: SearchViewProps) {
  return (
    <div className="max--w[1300px] mx-auto mb-10 flex flex-col gap-y-6 px-4 p-2.5">
      <CategoriesSection categoryId={categoryId} />
      <ResultsSection query={query} categoryId={categoryId} />
    </div>
  );
}
