import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { useLocation, useMatches } from "@remix-run/react";
import * as Sentry from "@sentry/remix";
import { useEffect } from "react";

const hydrate = () => {
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <RemixBrowser />
      </StrictMode>
    );
  });
};

if (window.requestIdleCallback) {
  window.requestIdleCallback(hydrate);
} else {
  // Safari doesn't support requestIdleCallback
  // https://caniuse.com/requestidlecallback
  window.setTimeout(hydrate, 1);
}

Sentry.init({
  dsn: "https://a8ee3e0c23e34c5b9991e3db0ac009c8:00ba9d8599a6479fa78914b9f989b123@o4504515201007616.ingest.sentry.io/4504515201925120",
  tracesSampleRate: 1,
  integrations: [
    new Sentry.BrowserTracing({
      routingInstrumentation: Sentry.remixRouterInstrumentation(
        useEffect,
        useLocation,
        useMatches
      ),
    }),
  ],
});
