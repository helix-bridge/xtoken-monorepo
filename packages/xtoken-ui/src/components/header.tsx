import { Link, useLocation } from "react-router-dom";
import { useToggle } from "../hooks";
import Tooltip from "../ui/tooltip";
import History from "./history";
import User from "./user";
import ChainSwitch from "./chain-switch";
import Drawer from "../ui/drawer";

interface NavigationConfig {
  label: string;
  href: string;
  external?: boolean;
  soon?: boolean;
  disabled?: boolean;
}

const navigationsConfig: NavigationConfig[] = [
  { href: "/", label: "Bridge" },
  { href: "/explorer", label: "Explorer" },
  { href: "https://paralink.darwinia.network", label: "Paralink", external: true },
  { href: "/wrap", label: "Wrap" },
];

export default function Header() {
  const { state: isOpen, setTrue: setIsOpenTrue, setFalse: setIsOpenFalse } = useToggle(false);
  const { pathname } = useLocation();

  return (
    <>
      <div
        className={`app-header px-medium fixed left-0 top-0 z-10 flex w-full items-center justify-between border-b border-b-white/25 lg:border-b-transparent lg:px-5 ${pathname === "/" ? "backdrop-blur lg:bg-transparent lg:backdrop-blur-none" : "bg-background"}`}
      >
        {/* Left */}
        <div className="flex items-center gap-5">
          <Link to="/">
            <img width={152} height={18} alt="Logo" src="images/projects/darwinia.png" />
          </Link>

          <div className="gap-medium hidden items-center lg:flex">
            {navigationsConfig.map(({ href, label, external, soon, disabled }) =>
              external ? (
                <a
                  rel="noopener noreferrer"
                  target="_blank"
                  href={href}
                  key={label}
                  className="py-small rounded-full px-3 text-sm font-bold text-white/50 transition-[transform,color] hover:bg-white/10 hover:text-white active:translate-y-1"
                >
                  {label}
                </a>
              ) : soon || disabled ? (
                <Tooltip key={label} content={soon ? "Coming soon" : "This feature is temporarily under maintenance"}>
                  <span className="py-small rounded-full px-3 text-sm font-bold text-white/50">{label}</span>
                </Tooltip>
              ) : (
                <Link
                  key={label}
                  to={href}
                  className={`py-small rounded-full px-3 text-sm font-bold transition-[transform,color] hover:bg-white/10 hover:text-white active:translate-y-1 ${
                    pathname === href ? "text-white underline decoration-2 underline-offset-8" : "text-white/50"
                  }`}
                >
                  {label}
                </Link>
              ),
            )}
          </div>
        </div>

        {/* Right */}
        <div className="gap-medium hidden items-center lg:flex">
          <History className="px-large bg-secondary inline-flex h-8 items-center rounded-full text-sm font-bold text-white transition-colors hover:bg-white/20" />
          <User placement="bottom-end" prefixLength={14} suffixLength={10} />
          <ChainSwitch placement="bottom-end" />
        </div>
        <img
          width={24}
          height={24}
          alt="Menu"
          src="images/menu.svg"
          className="inline transition-transform active:translate-y-1 lg:hidden"
          onClick={setIsOpenTrue}
        />
      </div>

      <Drawer maskClosable isOpen={isOpen} onClose={setIsOpenFalse}>
        <div className="flex w-full items-start justify-center" style={{ marginTop: "20%" }}>
          <div className="flex w-max flex-col items-start gap-10">
            <div className="gap-large flex flex-col">
              {navigationsConfig.map(({ label, href, external, soon, disabled }) =>
                external ? (
                  <a
                    rel="noopener noreferrer"
                    target="_blank"
                    href={href}
                    key={label}
                    className={`text-sm font-bold ${
                      pathname === href ? "text-primary underline decoration-2 underline-offset-4" : "text-white"
                    }`}
                  >
                    {label}
                  </a>
                ) : soon || disabled ? (
                  <Tooltip key={label} content={soon ? "Coming soon" : "This feature is temporarily under maintenance"}>
                    <span className="text-sm font-bold text-white/50">{label}</span>
                  </Tooltip>
                ) : (
                  <Link
                    key={label}
                    to={href}
                    className={`text-sm font-bold ${
                      pathname === href ? "text-primary underline decoration-2 underline-offset-4" : "text-white"
                    }`}
                    onClick={setIsOpenFalse}
                  >
                    {label}
                  </Link>
                ),
              )}
            </div>

            <div className="flex flex-col gap-2">
              <ChainSwitch />
              <User placement="bottom" onComplete={setIsOpenFalse} />
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
}
