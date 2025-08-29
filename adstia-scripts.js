const LOCAL_STORAGE_QUIZ_KEY = "quizValues";
const COOKIE_ANONYMOUS_ID = "__eventn_id";

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

const getCookie = (name) => {
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === " ") {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(name + "=") === 0) {
      return cookie.substring(name.length + 1);
    }
  }
  return null;
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

  updateData: function (data, keyMap) {
    return Object.entries(data).reduce((acc, [key, value]) => {
      // if key exists in map, replace with mapped key
      const newKey = keyMap[key] || key;
      acc[newKey] = value;
      return acc;
    }, {});
  },

  pushDataToRingbaTags: function () {
    const quizData = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_QUIZ_KEY) || "{}"
    );
    const searchParams = new URLSearchParams(window.location.search);

    const anonymousId = getCookie(COOKIE_ANONYMOUS_ID);

    const ringbaData = {
      ...quizData,
      ...Object.fromEntries(searchParams.entries()),
      user_id: localStorage.getItem("user_id") || "",
      session_id: sessionStorage.getItem("session_id") || "",
      anonymous_id: anonymousId || "",
    };

    const keyMap = {
      websiteCity: "city",
      websiteState: "state",
      websiteCountry: "country",
      websiteZip: "zip",
    };

    const filteredRingbaData = this.updateData(ringbaData, keyMap);

    try {
      const entries = Object.entries(filteredRingbaData);
      window._rgba_tags = window?._rgba_tags || [];

      entries.forEach((i) => {
        window?._rgba_tags?.push({ [i[0]]: i[1] });
      });
    } catch (err) {
      console.error("Error pushing data to Ringba tags:", err);
    }
  },
};
