import "./styles/styles.css";
import model from "./modules/model";
import view from "./modules/view";
import controller from "./modules/controller";

controller(model(), view());
