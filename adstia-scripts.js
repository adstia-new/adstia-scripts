const LOCAL_STORAGE_QUIZ_KEY = "quizValues";

const getDomainName = () => {
  const location = window.location;

  return location.host;
};

const getCurrentSlug = () => {
  const location = window.location;

  return location.pathname;
};

const getCurrentUrl = () => {
  const location = window.location;

  return location.href;
};

const getScreenResolution = () => {
  return `${window.screen.width}x${window.screen.height}`;
};

const getConnectionType = () => {
  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;
  return connection ? connection.effectiveType || "unknown" : "unknown";
};

window.adstiaScripts = {
  init: function () {
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

  fetchUserLocationAndDeviceInfo: async function () {
    if (
      typeof window === "undefined" ||
      !window?.cf_variable?.IP_ADDRESS_API_KEY
    )
      return;

    const IP_ADDRESS_API_KEY = window.cf_variable?.IP_ADDRESS_API_KEY;
    const IP_ADDRESS_API_URL = "https://api.ipify.org?format=json";
    const IP_ADDRESS_BASED_LOCATION_API_URL =
      "https://server.adstiacms.com/api/ip-address";
    const LOCAL_STORAGE_QUIZ_KEY = "quizValues";

    try {
      if (typeof window !== "undefined") {
        const storedData = JSON.parse(
          localStorage.getItem(LOCAL_STORAGE_QUIZ_KEY) || "{}"
        );

        if (!storedData.websiteZip) {
          const ipResponse = await fetch(IP_ADDRESS_API_URL);
          const ipData = await ipResponse.json();
          const userIp = ipData.ip;

          const locationResponse = await fetch(
            IP_ADDRESS_BASED_LOCATION_API_URL,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                ip: userIp,
                key: IP_ADDRESS_API_KEY,
              }),
            }
          );

          if (!locationResponse.ok) {
            throw new Error(`HTTP error! status: ${locationResponse.status}`);
          }

          const data = await locationResponse.json();
          const uaResult = UAParser();
          const savedTags = JSON.parse(
            localStorage.getItem(LOCAL_STORAGE_QUIZ_KEY) || "{}"
          );

          localStorage.setItem(
            LOCAL_STORAGE_QUIZ_KEY,
            JSON.stringify({
              ipCity: data.data.city,
              ipCountry: data.data.country,
              ipState: data.data.state,
              ipZip: data.data.postalCode,
              ipAddress: data.data.ipAddress,
              ipCountryCode: data.data.countryCode,
              device: uaResult.device.model?.toString() || "",
              browser: uaResult.browser.name?.toString() || "",
              os: uaResult.os.name?.toString() || "",
              userAgent: uaResult.ua?.toString() || "",
              osVersion: uaResult.os.version?.toString() || "",
              browserVersion: uaResult.browser.version?.toString() || "",
              deviceModel: uaResult.device.model?.toString() || "",
              ...savedTags,
            })
          );
        }
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
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
