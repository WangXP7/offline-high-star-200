import GithubStarButton from "./GithubStarButton";
import { portfolioSite } from "@/data/links";
import { useTranslation } from "react-i18next";
import { trackEvent, ANALYTICS_EVENTS } from "@/utils/analytics";
import DiscordButton from "./LevelSelection/components/DiscordButton";
import PatreonButton from "./PatreonButton";
import GithubButton from "./GithubButton";
import WallOfTextButton from "./WallOfTextButton";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="w-full text-sm font-sans lg:pl-44">
      <div className="max-w-4xl mx-auto px-4 flex flex-col items-center space-y-4">
        <div className="flex flex-wrap justify-center items-center gap-x-4 text-xs">
          <div className="h-6 flex space-x-2 items-center">
            <PatreonButton />
            <DiscordButton />
            <GithubButton />
            <WallOfTextButton />
            <GithubStarButton />
          </div>
        </div>
        <div className="mx-auto w-fit flex items-center divide-x divide-slate-700 space-x-3">
          <div>
            {t("CREATED_BY")}{" "}
            <a
              href={portfolioSite}
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium"
              onClick={() =>
                trackEvent(ANALYTICS_EVENTS.CLICK_EXTERNAL_LINK, {
                  link_url: portfolioSite,
                  link_name: "portfolio",
                })
              }
            >
              Sami
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
