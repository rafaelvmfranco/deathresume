import { StrictMode } from "react";
import * as ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

import { router } from "./router";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
