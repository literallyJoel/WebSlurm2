import { Link } from "@tanstack/react-router";
import UserToolbarBttn from "./userToolbarButton";

export default function Toolbar() {
  if (!location.pathname.includes("/setup")) {
    return (
      <div className="w-full flex flex-row  items-center px-12 justify-between bg-slate-800">
        <Link
          className="text-2xl font-bold"
          to={location.pathname.includes("/auth") ? "" : "/"}
        >
          Web<span className="text-fuchsia-600">Slurm</span>
        </Link>

        <UserToolbarBttn />
      </div>
    );
  }

  return null;
}
