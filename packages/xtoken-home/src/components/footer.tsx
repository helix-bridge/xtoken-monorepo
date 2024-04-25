import Image from "next/image";
import { PropsWithChildren } from "react";

interface Props {
  className?: string;
}

export default function Footer({ className }: Props) {
  return (
    <div
      className={`${className} lg:h-15 flex h-10 w-full items-center justify-center px-3 lg:justify-between lg:px-5`}
    >
      <span className="text-xs font-semibold text-white/50">{`© ${new Date().getFullYear()} Developed by Helix Bridge Team`}</span>
      <div className="hidden items-center gap-5 lg:flex">
        <Social href="https://github.com/helix-bridge">
          <Image width={16} height={16} alt="Github" src="/social/github.svg" />
        </Social>
        <Social href="https://twitter.com/helixbridges">
          <Image width={16} height={16} alt="Twitter" src="/social/twitter.svg" />
        </Social>
        <Social href="https://discord.gg/6XyyNGugdE">
          <Image width={20} height={20} alt="Discord" src="/social/discord.svg" />
        </Social>
        <Social href="mailto:hello@helixbridge.app">
          <Image width={16} height={16} alt="Email" src="/social/email.svg" />
        </Social>
      </div>
    </div>
  );
}

function Social({ children, href }: PropsWithChildren<{ href: string }>) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      href={href}
      className="opacity-60 transition-[transform,opacity] hover:-translate-y-[2px] hover:opacity-100 active:translate-y-0"
    >
      {children}
    </a>
  );
}
