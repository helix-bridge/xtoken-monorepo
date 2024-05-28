import { createHashRouter } from "react-router-dom";
import Root from "./routes/root";
import Home from "./routes/home";
import Explorer from "./routes/explorer";
import TxDetails from "./routes/tx-details";
import NotFound from "./routes/not-found";
import Error from "./routes/error";
import Wrap from "./routes/wrap";

export const router = createHashRouter([
  {
    element: <Root />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/explorer", element: <Explorer /> },
      { path: "/tx/:id", element: <TxDetails /> },
      { path: "/wrap", element: <Wrap /> },
      { path: "*", element: <NotFound /> },
    ],
    errorElement: <Error />,
  },
]);
