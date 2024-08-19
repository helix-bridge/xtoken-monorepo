import { Outlet } from "react-router-dom";
import Header from "../components/header";
import AppProvider from "../providers/app-provider";
import GraphqlProvider from "../providers/graphql-provider";
import RainbowProvider from "../providers/rainbow-provider";
import { StoreProvider } from "../store/provider";

export default function Root() {
  return (
    <GraphqlProvider>
      <RainbowProvider>
        <StoreProvider>
          <AppProvider>
            <Header />
            <Outlet />
          </AppProvider>
        </StoreProvider>
      </RainbowProvider>
    </GraphqlProvider>
  );
}
