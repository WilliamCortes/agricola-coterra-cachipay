import { type ReactNode, useLayoutEffect, useState } from "react";

type HeroBreadcrumbLayoutProps = {
  hero: ReactNode;
  breadcrumb: ReactNode;
  children: ReactNode;
};

export function HeroBreadcrumbLayout({
  hero,
  breadcrumb,
  children,
}: HeroBreadcrumbLayoutProps) {
  const [navbarHeight, setNavbarHeight] = useState(0);

  useLayoutEffect(() => {
    const navbar = document.querySelector<HTMLElement>('nav[data-navbar="main"]');
    if (!navbar) return;

    const update = () => {
      setNavbarHeight(Math.ceil(navbar.getBoundingClientRect().height));
    };

    update();

    const resizeObserver = new ResizeObserver(() => update());
    resizeObserver.observe(navbar);

    window.addEventListener("resize", update, { passive: true });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <>
      {hero}
      <div
        className="bg-background border-b border-border/60 sticky z-40 shadow-md"
        style={{ top: navbarHeight }}
      >
        <div className="container mx-auto px-4 py-3">{breadcrumb}</div>
      </div>
      {children}
    </>
  );
}
