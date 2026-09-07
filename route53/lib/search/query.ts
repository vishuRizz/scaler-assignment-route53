import catalog from "@/data/search.json";
import {
  SEARCH_CATEGORIES,
  type SearchCatalog,
  type SearchCategoryId,
  type SearchItem,
} from "./types";

const data = catalog as SearchCatalog;

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function matchesQuery(item: SearchItem, query: string): boolean {
  if (!query) return true;
  const haystack = normalize(
    `${item.title} ${item.description} ${item.service} ${item.category}`,
  );
  const tokens = normalize(query).split(" ").filter(Boolean);
  return tokens.every((token) => haystack.includes(token));
}

/** Map catalog paths onto this app’s routes where we have pages. */
export function resolveSearchHref(href: string): string {
  if (href === "/route53/hosted-zones" || href.startsWith("/route53/hosted-zones/")) {
    return "/hosted-zones";
  }
  if (href.startsWith("/route53/")) {
    return "/hosted-zones";
  }
  return href;
}

export function searchCatalog(
  query: string,
  category?: SearchCategoryId | "all",
): Record<SearchCategoryId, SearchItem[]> {
  const q = normalize(query);
  const result = {} as Record<SearchCategoryId, SearchItem[]>;

  for (const { id } of SEARCH_CATEGORIES) {
    if (category && category !== "all" && category !== id) {
      result[id] = [];
      continue;
    }
    result[id] = data[id].filter((item) => matchesQuery(item, q));
  }

  return result;
}

export function countResults(
  groups: Record<SearchCategoryId, SearchItem[]>,
): number {
  return SEARCH_CATEGORIES.reduce(
    (sum, { id }) => sum + groups[id].length,
    0,
  );
}

export { data as searchData };
