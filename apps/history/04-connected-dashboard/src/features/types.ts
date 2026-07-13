import type { Dispatch } from "react";
import type { ReturnTypeOfModel } from "./utilityTypes";
import type { AppCommand, AppState } from "../application/store";

export interface FeatureProps {
  state: AppState;
  dispatch: Dispatch<AppCommand>;
  model: ReturnTypeOfModel;
}

