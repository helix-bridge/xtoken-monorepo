import type { MDXComponents } from "mdx/types";
import Link from "next/link";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    code: ({ children }) => (
      <code className="rounded bg-white/20 before:content-[''] after:content-['']">{children}</code>
    ),
    h2: ({ children }) => (
      <h2 className="group flex items-center gap-2" id={children?.toString().toLowerCase()}>
        {children}{" "}
        <Link
          href={`#${children?.toString().toLowerCase()}`}
          className="text-primary no-underline opacity-0 transition-opacity hover:underline group-hover:opacity-100"
        >
          #
        </Link>
      </h2>
    ),
    ...components,
  };
}
