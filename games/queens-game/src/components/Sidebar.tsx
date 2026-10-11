import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import Queen from "@/components/Queen";
import NewBadge from "./NewBadge";
import {
  getCommunityLevelsClicked,
  setCommunityLevelsClicked,
} from "@/utils/localStorage";
import { trackEvent, ANALYTICS_EVENTS } from "../utils/analytics";
import { Sidebar as DesktopSidebar } from "@/components/ui/sidebar";

const NAV_LINKS = [
  { to: "/", labelKey: "HOME", isNew: false },
  { to: "/level-builder", labelKey: "LEVEL_BUILDER", isNew: false },
  { to: "/settings/palette", labelKey: "Custom Palette", isNew: false },
  { to: "/updates", labelKey: "UPDATES", isNew: false, type: "secondary" },
];

const Sidebar = ({ className = "" }) => {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  const communityLevelsClicked = getCommunityLevelsClicked();

  const handleCommunityLevelsClick = () => {
    if (!communityLevelsClicked) {
      setCommunityLevelsClicked(true);
    }
  };

  const handleThemeChange = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    trackEvent(ANALYTICS_EVENTS.SELECT_CONTENT, {
      content_type: "theme",
      item_id: newTheme,
    });
  };

  const NavigationItem = ({
    link,
  }: {
    link: {
      to: string;
      labelKey: string;
      type?: string;
      isNew?: boolean;
    };
  }) => (
    <li key={link.to} className="relative w-full">
      <NavLink
        to={link.to}
        className={({ isActive }) =>
          `block p-2 w-full rounded ${isActive ? "bg-primary text-white" : "hover:bg-primary/25"}`
        }
        onClick={() => {
          if (link.labelKey === "COMMUNITY_LEVELS")
            handleCommunityLevelsClick();
        }}
        viewTransition
      >
        {t(link.labelKey)}
      </NavLink>
      {link.isNew && <NewBadge className="absolute -top-3 -right-4 z-10" />}
    </li>
  );

  return (
    <DesktopSidebar className={className} aria-label="Main navigation">
      <div className="flex flex-col w-full h-full">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-3 font-medium w-full">
            <Link to="/" className="flex items-center space-x-2">
              <Queen className="dark:fill-yellow-400" />
              <h1 className="text-xl sm:text-2xl">Queens</h1>
            </Link>
          </div>

          <ul className="flex flex-col w-full gap-2">
            {NAV_LINKS.filter((link) => link.type !== "secondary").map(
              (link) => (
                <NavigationItem key={link.to} link={link} />
              ),
            )}
          </ul>

          <hr className="my-2 w-full border-t border-primary/25" />

          <ul className="flex flex-col w-full gap-2">
            {NAV_LINKS.filter((link) => link.type === "secondary").map(
              (link) => (
                <NavigationItem key={link.to} link={link} />
              ),
            )}
          </ul>
        </div>

        <div className="mt-auto flex flex-col gap-2">
          <button
            onClick={handleThemeChange}
            className="w-fit flex items-center p-2 rounded-md transition-colors hover:bg-primary/25"
          >
            {theme === "light" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </DesktopSidebar>
  );
};

export default Sidebar;
