import Footer from "@/components/footer";
import Image from "next/image";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <div className="container flex flex-col items-center justify-center gap-12 px-3 lg:flex-row lg:justify-between lg:gap-3">
        <div className="flex flex-col">
          <Image alt="Logo" width={210} height={56} src="/logo.svg" className="shrink-0" />
          <span className="mt-11 inline-block text-3xl font-bold text-white lg:w-[32.8rem]">
            XToken, Helix&apos;s Bridge as a Service Open Platform
          </span>
          <span className="mt-5 inline-block text-sm font-normal text-white/60 lg:w-[36rem]">
            XToken BAAS(Bridge as a Service) offers professional cross-chain token mapping bridge services tailored for
            cryptocurrency token issuance projects or custodial applications. Clients maintain full control over
            contracts and asset permissions. Our comprehensive services include BAAS solution consulting, contract
            deployment, indexing, and UI cloud services. Custom domain provisioning is also available. For inquiries,
            please contact hello@helixbridge.app.
          </span>
        </div>
        <div className="flex items-center gap-8">
          <Card icon="/darwinia.png" link="https://bridge.darwinia.network" label="Darwinia" />
          <Card icon="/docs.png" link="./docs.html" label="Docs" />
        </div>
      </div>

      <Footer className="fixed bottom-0 left-0" />

      <div
        className="absolute -bottom-[90vw] left-0 h-[100vw] w-screen rounded-full opacity-40 blur-[6.15rem]"
        style={{
          background: "linear-gradient(#1859FF 100%, #0286FF 100%), linear-gradient(271deg, #1859FF 0%, #0286FF 100%)",
        }}
      />
    </main>
  );
}

function Card({ icon, link, label, isExternal }: { icon: string; link: string; label: string; isExternal?: boolean }) {
  return (
    <a
      className="bg-secondary group flex h-52 w-40 flex-col items-center justify-center gap-7 rounded-3xl transition-shadow hover:shadow-[0px_0px_40px_0px_rgba(0,133,255,0.50)]"
      target={isExternal ? "_blank" : "_self"}
      rel={isExternal ? "noopener noreferrer" : undefined}
      href={link}
    >
      <Image alt={label} width={70} height={70} src={icon} className="shrink-0 rounded-full" />
      <div className="flex items-center gap-3">
        <span className="text-base font-bold text-white">{label}</span>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
          <span className="flex h-2 w-2 items-center justify-center rounded-full bg-white transition-all group-hover:h-5 group-hover:w-5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true"
              className="text-primary h-0 w-0 transition-all group-hover:h-3 group-hover:w-3"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"></path>
            </svg>
          </span>
        </span>
      </div>
    </a>
  );
}
