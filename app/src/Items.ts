/*
enum BaseResource {
  stone = "stone",
  iron = "iron",
  silver = "silver",
  gold = "gold",
  ruby = "ruby",
  wood = "wood",
}
*/

type AbstractRecipe = {
  wood: number;
  resource: number;
};

type Recipe = {
  wood?: number;
  ruby?: number;
  silver?: number;
  iron?: number;
  gold?: number;
  stone?: number;
};

type Item = {
  title: string;
  recipe: Recipe;
};

type AbstractItem = {
  title: string;
  recipe: AbstractRecipe;
};

const baseResources = [
  {
    title: "Gold",
    id: "gold",
    recipeGenerator: ({ wood, resource }: AbstractRecipe): Recipe => ({
      wood,
      gold: resource,
    }),
  },
  {
    title: "Stone",
    id: "stone",
    recipeGenerator: ({ wood, resource }: AbstractRecipe): Recipe => ({
      wood,
      stone: resource,
    }),
  },
  {
    title: "Silver",
    id: "silver",
    recipeGenerator: ({ wood, resource }: AbstractRecipe): Recipe => ({
      wood,
      silver: resource,
    }),
  },
  {
    title: "Iron",
    id: "iron",
    recipeGenerator: ({ wood, resource }: AbstractRecipe): Recipe => ({
      wood,
      iron: resource,
    }),
  },
  {
    title: "Ruby",
    id: "ruby",
    recipeGenerator: ({ wood, resource }: AbstractRecipe): Recipe => ({
      wood,
      ruby: resource,
    }),
  },
  {
    title: "Wood",
    id: "wood",
    recipeGenerator: ({ wood, resource }: AbstractRecipe): Recipe => ({ wood }),
  },
];

const baseItems: AbstractItem[] = [
  { title: "Axe", recipe: { wood: 2, resource: 3 } },
  { title: "Pickxe", recipe: { wood: 2, resource: 3 } },
  { title: "Shortsword", recipe: { wood: 2, resource: 3 } },
  { title: "Longsword", recipe: { wood: 2, resource: 3 } },
];

export const items: Item[] = baseResources
  .filter((resource) => resource.id !== "wood")
  .flatMap((resource) =>
    baseItems.map((item) => ({
      title: resource.title + " " + item.title,
      recipe: resource.recipeGenerator(item.recipe),
    }))
  );
