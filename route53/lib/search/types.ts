export type SearchItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  service: string;
  icon: string;
  href: string;
  resourceType?: string;
};

export type SearchCatalog = {
  services: SearchItem[];
  features: SearchItem[];
  documents: SearchItem[];
  knowledgeArticles: SearchItem[];
  tutorials: SearchItem[];
  blogs: SearchItem[];
  events: SearchItem[];
  marketplace: SearchItem[];
  resources: SearchItem[];
};

export type SearchCategoryId =
  | "services"
  | "features"
  | "documents"
  | "knowledgeArticles"
  | "marketplace"
  | "blogs"
  | "events"
  | "tutorials";

export const SEARCH_CATEGORIES: {
  id: SearchCategoryId;
  label: string;
}[] = [
  { id: "services", label: "Services" },
  { id: "features", label: "Features" },
  { id: "documents", label: "Documentation" },
  { id: "knowledgeArticles", label: "Knowledge articles" },
  { id: "marketplace", label: "Marketplace" },
  { id: "blogs", label: "Blog posts" },
  { id: "events", label: "Events" },
  { id: "tutorials", label: "Tutorials" },
];
