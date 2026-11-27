import type {
  ChapterSource,
  SearchPage,
  SourceExtension,
  SourceExtensionApi,
} from "comic-dl/extension";

// Keep the workspace buildable with its published API v1 development dependency.
// These optional capabilities are consumed by comic-dl 3.2+.
export type OptionValue = string | boolean | number;
export type OptionValues = Readonly<Record<string, OptionValue>>;
type Choice = { readonly id: string; readonly label: string };
type Mode = "browse" | "search";
type Settings = Readonly<
  Record<
    string,
    {
      readonly type: "text" | "url";
      readonly label: string;
      readonly default?: string;
      readonly env?: string;
    }
  >
>;
type Catalog = Readonly<
  Partial<
    Record<
      Mode,
      {
        readonly sorts?: readonly Choice[];
        readonly filters?: Readonly<
          Record<
            string,
            {
              readonly label: string;
            } & (
              | { readonly type: "dynamic-select" }
              | { readonly type: "select"; readonly choices: readonly Choice[] }
            )
          >
        >;
      }
    >
  >
>;

export interface ConfigurableSourceExtension extends SourceExtension {
  readonly settings?: Settings;
  readonly catalog?: Catalog;
  validateSettings?(settings: OptionValues): void;
  matchesUrl?(
    url: URL,
    kind: "series" | "chapter",
    settings?: OptionValues,
  ): boolean;
  create(
    api: SourceExtensionApi,
    settings?: OptionValues,
  ): Omit<ChapterSource, "search"> & {
    search?(
      query: string,
      page: number,
      signal: AbortSignal,
      options?: { readonly sort?: string; readonly filters?: OptionValues },
    ): Promise<SearchPage>;
    catalogChoices?(
      filter: string,
      mode: Mode,
      signal: AbortSignal,
    ): Promise<readonly Choice[]>;
  };
}
