declare module "zod" {
  export interface ZodTypeAny {}
  export interface ZodString extends ZodTypeAny {}
  export interface ZodObject<T extends Record<string, ZodTypeAny>> extends ZodTypeAny {}
}
