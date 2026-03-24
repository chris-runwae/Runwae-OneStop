import { HomeIcon } from "@/components/icons/HomeIcon";
import { PlaneIcon } from "@/components/icons/PlaneIcon";
import { SearchIcon } from "@/components/icons/SearchIcon";
import { Tab } from "@/types/tabs.type";
import { User } from "lucide-react-native";

const ORIENTATION = {
  HORIZONTAL: "horizontal",
  VERTICAL: "vertical",
};

export const constants = {
  ORIENTATION,
  ...ORIENTATION,
};

export const tabs: Tab[] = [
  {
    name: "home",
    title: "Home",
    icon: HomeIcon,
    route: "/",
  },

  {
    name: "explore",
    title: "Explore",
    icon: SearchIcon,
    route: "/explore",
  },
  {
    name: "trips",
    title: "Trips",
    icon: PlaneIcon,
    route: "/(trips)",
  },
  {
    name: "profile",
    title: "Profile",
    icon: User,
    route: "/profile",
  },
];
