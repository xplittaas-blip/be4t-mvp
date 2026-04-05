// Type shim so the IDE doesn't flag Deno globals as errors.
// These types are provided by the Supabase Edge Functions runtime at deploy time.
declare namespace Deno {
    const env: { get(key: string): string | undefined };
    function serve(handler: (req: Request) => Response | Promise<Response>): void;
}
