import { Outlet } from "react-router-dom";
import Header from "../components/header";
import AppProvider from "../providers/app-provider";
import GraphqlProvider from "../providers/graphql-provider";
import RainbowProvider from "../providers/rainbow-provider";
import { StoreProvider } from "../store/provider";
import WalletProvider from "../providers/wallet-provider";

export default function Root() {
  return (
    <GraphqlProvider>
      <RainbowProvider>
        <StoreProvider>
          <WalletProvider>
            <AppProvider>
              <Header />
              <Outlet />
            </AppProvider>
          </WalletProvider>
        </StoreProvider>
      </RainbowProvider>
    </GraphqlProvider>
  );
}
