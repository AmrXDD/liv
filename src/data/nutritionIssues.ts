// Nutrition issues now live in Supabase (tables: nutrition_issue_groups,
// nutrition_issue_items). The admin can CRUD them at /admin/nutrition-issues.
// This file only exposes the TypeScript types — fetching happens via the
// useNutritionIssues() hook in @/lib/queries.

import type { LocalizedString } from "@/types";

export interface NutritionIssueItem {
  id: string;
  slug: string;
  label: LocalizedString;
  position: number;
}

export interface NutritionIssueGroup {
  id: string;
  slug: string;
  label: LocalizedString;
  position: number;
  items: NutritionIssueItem[];
}

export function labelForIssueSlug(
  groups: NutritionIssueGroup[],
  slug: string,
  lang: "en" | "ar",
): string {
  for (const g of groups) {
    const found = g.items.find((i) => i.slug === slug);
    if (found) return found.label[lang];
  }
  return slug;
}
