const LOCAL_STORAGE_QUIZ_KEY = "quizValues";

export const getDomainName = () => {
  const location = window.location;

  return location.host;
};

export const getCurrentSlug = () => {
  const location = window.location;

  return location.pathname;
};

export const getCurrentUrl = () => {
  const location = window.location;

  return location.href;
};

export const getScreenResolution = () => {
  return `${window.screen.width}x${window.screen.height}`;
};

export const getConnectionType = () => {
  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;
  return connection ? connection.effectiveType || "unknown" : "unknown";
};

window.adstiaScripts = {
  init: function () {
    // Save Extra Data to localStorage
    const domainName = getDomainName();
    const domainSlug = getCurrentSlug();
    const finalUrl = getCurrentUrl();
    const screenResolution = getScreenResolution();
    const connectionType = getConnectionType();

    const quizValues = localStorage.getItem(LOCAL_STORAGE_QUIZ_KEY);
    const parsedQuizValues = quizValues ? JSON.parse(quizValues) : {};

    const newQuizValuesData = {
      ...parsedQuizValues,
      domainName,
      domainSlug,
      finalUrl,
      screenResolution,
      connectionType,
    };

    localStorage.setItem(
      LOCAL_STORAGE_QUIZ_KEY,
      JSON.stringify(newQuizValuesData)
    );
  },
  replaceShortcodes: function (str) {
    try {
      if (typeof window !== "undefined") {
        const urlSearchParams = new URLSearchParams(window.location.search);

        const paramsShortcodes = Object.fromEntries(urlSearchParams.entries());

        const userId = localStorage.getItem("user_id") || "";

        const shortcodes = {
          user_id: userId,
          referral_d: window.location.hostname,
          ...paramsShortcodes,
        };

        const replaced = str.replace(/\{\{query\.(.*?)\}\}/g, (_, match) => {
          return shortcodes[match.trim()] || "";
        });

        if (replaced.endsWith("?")) {
          return replaced.slice(0, -1);
        }

        return replaced;
      }
      return "";
    } catch (e) {
      console.error("Failed to replace Shortcodes", e);
      return str;
    }
  },
};
