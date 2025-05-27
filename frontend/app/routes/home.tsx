import type { LoaderFunctionArgs } from "react-router";
import { Welcome } from "../welcome/welcome";

export function meta({}: LoaderFunctionArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return <Welcome />;
}
