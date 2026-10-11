import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import Queen from "@/components/Queen";
import LanguageDropdown from "./LevelSelection/components/LanguageDropdown";
import { trackEvent, ANALYTICS_EVENTS } from "@/utils/analytics";
import {
  getCommunityLevelsClicked,
  setCommunityLevelsClicked,
} from "@/utils/localStorage";
import {
  SidebarDrawer,
  SidebarDrawerTrigger,
  SidebarDrawerPortal,
  SidebarDrawerContent,
  SidebarDrawerCloseButton,
} from "@/components/ui/sidebar";

const NAV_LINKS = [
  { to: "/", labelKey: "HOME", isNew: false },
  { to: "/level-builder", labelKey: "LEVEL_BUILDER", isNew: false },
  { to: "/settings/palette", labelKey: "Custom Palette", isNew: false },
  { to: "/updates", labelKey: "UPDATES", isNew: false, type: "secondary" },
];

const Navbar = () => {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  return (
    <nav className="relative rounded-2xl p-4 w-full">
      <div className="max-w-7xl flex justify-between items-center w-full mx-auto">
        <div className="flex items-center space-x-4">
          <SidebarDrawer open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SidebarDrawerTrigger asChild>
              <button
                className="lg:hidden flex"
                aria-label="Open navigation menu"
                type="button"
              >
                <span className="relative inline-flex">
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </span>
              </button>
            </SidebarDrawerTrigger>

            <SidebarDrawerPortal>
              <SidebarDrawerContent className="lg:hidden">
                <div className="flex items-center justify-between mb-6">
                  <Link to="/" className="flex items-center space-x-2">
                    <Queen className="dark:fill-yellow-400" />
                    <h1 className="text-xl sm:text-2xl">Queens</h1>
                  </Link>
                  <SidebarDrawerCloseButton asChild>
                    <button type="button" aria-label="Close navigation menu">
                      <X size={24} />
                    </button>
                  </SidebarDrawerCloseButton>
                </div>

                <ul className="space-y-2">
                  {NAV_LINKS.filter((link) => link.type !== "secondary").map(
                    (link) => (
                      <li key={link.to} className="relative">
                        <NavLink
                          to={link.to}
                          className={({ isActive }) =>
                            isActive
                              ? "bg-primary text-white p-2 rounded w-full flex"
                              : "w-full flex p-2 rounded hover:bg-primary/10"
                          }
                          onClick={() => {
                            setIsMenuOpen(false);
                            if (link.labelKey === "COMMUNITY_LEVELS") {
                              handleCommunityLevelsClick();
                            }
                          }}
                        >
                          {t(link.labelKey)}
                        </NavLink>
                      </li>
                    ),
                  )}
                </ul>

                <hr className="my-2 w-full border-t border-primary/25" />

                <ul className="flex flex-col w-full gap-2">
                  {NAV_LINKS.filter((link) => link.type === "secondary").map(
                    (link) => (
                      <li key={link.to} className="relative">
                        <NavLink
                          to={link.to}
                          className={({ isActive }) =>
                            isActive
                              ? "bg-primary text-white p-2 rounded w-full flex"
                              : "w-full flex p-2 rounded hover:bg-primary/10"
                          }
                          onClick={() => {
                            setIsMenuOpen(false);
                            if (link.labelKey === "COMMUNITY_LEVELS") {
                              handleCommunityLevelsClick();
                            }
                          }}
                        >
                          {t(link.labelKey)}
                        </NavLink>
                      </li>
                    ),
                  )}
                </ul>

                <div className="mt-auto flex flex-col gap-2">
                  <button
                    onClick={handleThemeChange}
                    className="w-fit flex items-center p-2 rounded-md transition-colors hover:bg-primary/25"
                  >
                    {theme === "light" ? <Sun size={18} /> : <Moon size={18} />}
                  </button>
                </div>
              </SidebarDrawerContent>
            </SidebarDrawerPortal>
          </SidebarDrawer>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-6">
          <LanguageDropdown />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
