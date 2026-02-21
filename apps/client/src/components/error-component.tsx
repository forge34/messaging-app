import { ApiError } from "@/lib/error";
import { useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { AlertCircle, RotateCcw, Home, ChevronRight } from "lucide-react";

export function ErrorComponent({ error }: ErrorComponentProps) {
  const router = useRouter();

  const isApiError = error instanceof ApiError;
  const apiData = isApiError ? error.data : null;
  const status = apiData?.status ?? "Unknown";

  return (
    <div className="flex bg-background min-h-screen w-full flex-col items-center justify-center rounded-xl p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive shadow-sm animate-in zoom-in duration-300">
        <AlertCircle size={32} />
      </div>

      <div className="mt-6 max-w-md">
        <h2 className="text-lg font-bold text-foreground">
          {isApiError ? `Server Error (${status})` : "Application Error"}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {error.message || "An unexpected error occurred."}
        </p>
      </div>

      {apiData && (apiData.messages || apiData.fields) && (
        <div className="mt-6 w-full max-w-sm rounded-lg border border-border bg-card p-4 text-left shadow-sm">
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
            Error Details
          </p>

          {apiData.messages && apiData.messages.length > 0 && (
            <ul className="space-y-1 mb-3">
              {apiData.messages.map((msg, i) => (
                <li
                  key={i}
                  className="text-xs text-destructive flex items-start gap-1"
                >
                  <ChevronRight size={12} className="mt-0.5 shrink-0" />
                  {msg}
                </li>
              ))}
            </ul>
          )}

          {apiData.fields && (
            <div className="space-y-2">
              {Object.entries(apiData.fields).map(([field, errors]) => (
                <div key={field} className="text-xs">
                  <span className="font-bold text-foreground capitalize">
                    {field}:{" "}
                  </span>
                  <span className="text-muted-foreground">
                    {errors.join(", ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => router.invalidate()}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 active:scale-95 shadow-sm"
        >
          <RotateCcw size={16} />
          Try Again
        </button>

        <button
          onClick={() => (window.location.href = "/")}
          className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-accent hover:text-accent-foreground active:scale-95 shadow-sm"
        >
          <Home size={16} />
          Go Home
        </button>
      </div>
    </div>
  );
}
