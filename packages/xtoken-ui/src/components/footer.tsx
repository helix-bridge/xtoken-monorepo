import { PropsWithChildren } from "react";

export default function Footer() {
  return (
    <div className="app-footer px-medium flex items-center justify-center lg:justify-between lg:px-5">
      <span className="text-xs font-semibold text-white/50">{`© ${new Date().getFullYear()} Powered by Helixbox Bridge`}</span>

      <div className="hidden items-center gap-5 lg:flex">
        <a
          className="text-xs font-semibold text-white/50 transition hover:text-white active:scale-95"
          href="https://para.link/"
          rel="noopener noreferrer"
          target="_blank"
        >
          Darwinia Paralink
        </a>
        <a
          className="text-xs font-semibold text-white/50 transition hover:text-white active:scale-95"
          href="https://docs.helixbox.ai/"
          rel="noopener noreferrer"
          target="_blank"
        >
          Docs
        </a>

        <div className="h-3 w-[1px] bg-white/30" />

        <SocialLink href="https://github.com/helix-bridge">
          <img width={16} height={16} alt="Github" src="images/social/github.svg" />
        </SocialLink>
        <SocialLink href="https://x.com/HelixboxLabs">
          <img width={15.3} height={14} alt="Twitter" src="images/social/x.svg" />
        </SocialLink>
        <SocialLink href="https://discord.gg/6XyyNGugdE">
          <img width={20} height={20} alt="Discord" src="images/social/discord.svg" />
        </SocialLink>
        <SocialLink href="mailto:hello@helixbox.ai">
          <img width={16} height={16} alt="Email" src="images/social/email.svg" />
        </SocialLink>
      </div>
    </div>
  );
}

function SocialLink({ children, href }: PropsWithChildren<{ href: string }>) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      href={href}
      className="hidden opacity-60 transition hover:scale-105 hover:opacity-100 active:scale-95 lg:inline"
    >
      {children}
    </a>
  );
}
