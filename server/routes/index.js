import loginRoutes from "./loginRoutes.js";
import seedRoutes from "./seedRoutes.js";

const routes = (app) => {
  loginRoutes(app);
  seedRoutes(app);
};

export default routes;
