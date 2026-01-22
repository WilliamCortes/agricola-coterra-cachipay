import { useEffect, useMemo, useRef, useState } from "react";

const CONSENT_COOKIE_NAME = "agricola_cookie_consent";
const CONSENT_VERSION = "v1";
const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function getCookie(name: string) {
  const cookies = typeof document === "undefined" ? "" : document.cookie;
  const parts = cookies.split(";").map((c) => c.trim());
  for (const part of parts) {
    if (!part) continue;
    const [k, ...rest] = part.split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

function setConsentCookie(value: string) {
  const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(
    value,
  )}; Max-Age=${CONSENT_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`;
}

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const consentValue = useMemo(() => `${CONSENT_VERSION}:accepted`, []);

  useEffect(() => {
    const current = getCookie(CONSENT_COOKIE_NAME);
    if (current === consentValue) return;
    setIsVisible(true);
  }, [consentValue]);

  useEffect(() => {
    if (!isVisible) return;
    dialogRef.current?.focus();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setConsentCookie(consentValue);
        setIsVisible(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [consentValue, isVisible]);

  const accept = () => {
    setConsentCookie(consentValue);
    setIsVisible(false);
  };

  const dismiss = () => {
    setConsentCookie(consentValue);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      id="hs-eu-cookie-confirmation"
      className="hs-banner-optimization-animation fixed bottom-0 left-0 right-0 z-50 p-4"
      data-nosnippet="true"
      role="dialog"
      aria-describedby="hs-eu-policy-wording"
      aria-label="Cookie banner"
      tabIndex={0}
      ref={dialogRef}
    >
      <div
        id="hs-eu-cookie-confirmation-inner"
        className="mx-auto w-full max-w-4xl rounded-2xl border border-border bg-white shadow-xl"
      >
        <div id="hs-eu-header-container" className="flex items-center justify-end p-3">
          <button
            id="hs-eu-close-button"
            className="hs-close-button rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Dismiss cookie banner"
            tabIndex={0}
            onClick={dismiss}
            type="button"
          >
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="h-5 w-5">
              <path
                fill="currentColor"
                d="M4.3,27.7c0.2,0.2,0.6,0.5,1,0.5c0.4,0,0.8-0.2,1-0.5l9.6-9.5l9.6,9.5c0.2,0.2,0.6,0.5,1,0.5 c0.8,0,1.5-0.6,1.5-1.5c0-0.4-0.2-0.8-0.5-1L18.2,16l9.5-9.5c0.2-0.2,0.4-0.6,0.4-1c0-0.8-0.6-1.5-1.5-1.5c-0.4,0-0.7,0.2-1,0.4l0,0 L16,13.8L6.5,4.3C6.2,4,5.8,3.8,5.4,3.8c-0.8,0-1.5,0.6-1.5,1.5c0,0.5,0.2,0.8,0.5,1.1l0,0l9.5,9.5l-9.5,9.6c-0.2,0.2-0.5,0.6-0.5,1 S4.1,27.4,4.3,27.7L4.3,27.7z"
              />
            </svg>
          </button>
        </div>

        <div id="hs-eu-policy-wording" tabIndex={0} className="px-5 pb-4">
          <div>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Usamos cookies para mejorar tu experiencia de navegación y analizar el uso de nuestro sitio. Al continuar,
              aceptas su uso. Consulta nuestra{" "}
              <a href="/privacy" className="text-primary underline underline-offset-2 hover:text-secondary">
                Política de privacidad
              </a>
              .
            </p>
          </div>
        </div>

        <div id="hs-eu-cookie-confirmation-buttons-area" className="px-5 pb-5">
          <div id="hs-eu-confirmation-button-group" className="flex items-center justify-end gap-3">
            <div id="hs-eu-opt-in-buttons">
              <button
                id="hs-eu-confirmation-button"
                aria-label="Continuar"
                tabIndex={0}
                type="button"
                onClick={accept}
                className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

