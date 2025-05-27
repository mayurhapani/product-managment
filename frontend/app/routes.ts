import { type RouteConfig, route, index } from "@react-router/dev/routes";

export default [
  index("routes/products/route.tsx"),
  route("products/new", "routes/products/new/route.tsx"),
  route("products/:id/edit", "routes/products/$id/edit/route.tsx")
] satisfies RouteConfig;
