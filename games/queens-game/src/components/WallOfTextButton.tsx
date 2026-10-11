import WallOfTextIcon from "@/components/icons/WallOfTextIcon";
import { wallOfText } from "@/data/links";
import { ANALYTICS_EVENTS, trackEvent } from "@/utils/analytics";

const WallOfTextButton = () => {
  return (
    <div>
      <a
        href={wallOfText}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() =>
          trackEvent(ANALYTICS_EVENTS.CLICK_EXTERNAL_LINK, {
            link_url: wallOfText,
            link_name: "github",
          })
        }
      >
        <WallOfTextIcon className="h-4 sm:h-5" />
      </a>
    </div>
  );
};

export default WallOfTextButton;
