import { useTheme } from "next-themes";
import GithubIcon from "@/components/icons/GithubIcon";
import GithubIconWhite from "./icons/GithubIconWhite";
import { queensGameRepo } from "@/data/links";
import { trackEvent, ANALYTICS_EVENTS } from "@/utils/analytics";

const GithubButton = () => {
  const { theme } = useTheme();

  return (
    <div>
      <a
        href={queensGameRepo}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() =>
          trackEvent(ANALYTICS_EVENTS.CLICK_EXTERNAL_LINK, {
            link_url: queensGameRepo,
            link_name: "github",
          })
        }
      >
        {theme === "dark" ? (
          <GithubIconWhite className="h-4 sm:h-5" />
        ) : (
          <GithubIcon className="h-4 sm:h-5" />
        )}
      </a>
    </div>
  );
};

export default GithubButton;
