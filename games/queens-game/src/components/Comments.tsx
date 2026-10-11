import Giscus from "@giscus/react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { getGiscusLanguage } from "@/utils/getGiscusLanguage";

export default function Comments() {
  const [error, setError] = useState<string | null>(null);
  const [showSignInHint, setShowSignInHint] = useState(false);
  const { theme } = useTheme();
  const { i18n } = useTranslation();

  const handleMessage = (event: MessageEvent) => {
    if (event.origin !== "https://giscus.app") return;

    try {
      const data = event.data?.giscus;
      if (
        data.error?.includes("API rate limit already exceeded") ||
        data.message?.includes("API rate limit already exceeded")
      ) {
        setError(
          "Comments are temporarily unavailable due to GitHub API rate limits.",
        );
        setShowSignInHint(true);
      } else if (data.error?.includes("not found")) {
        setError("");
      } else if (data.error) {
        setError("Failed to load comments. Please try again later.");
      }
    } catch (e) {
      // Ignore non-JSON messages
    }
  };

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="comments-section w-full px-2">
      {error && (
        <div className="rate-limit-notice p-4 bg-yellow-50 border border-yellow-200 rounded-md text-sm">
          <p className="font-medium text-yellow-800">{error}</p>

          {showSignInHint && (
            <p className="mt-2 text-yellow-700">
              Signing in with GitHub usually increases the rate limit
              significantly.
              <br />
              Try refreshing the page after signing in.
            </p>
          )}

          <button
            onClick={() => {
              setError(null);
              setShowSignInHint(false);
              window.location.reload();
            }}
            className="mt-3 text-blue-600 hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {!error && (
        <Giscus
          repo="samimsu/queens-game"
          repoId="R_kgDONCfeAg"
          category="Announcements"
          categoryId="DIC_kwDONCfeAs4CnIas"
          mapping="pathname"
          strict="1"
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="bottom"
          theme={theme}
          lang={getGiscusLanguage(i18n.language) || i18n.language}
          loading="lazy"
        />
      )}
    </div>
  );
}
