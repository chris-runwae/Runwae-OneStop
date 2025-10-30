declare module '@supabase/functions' {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};
