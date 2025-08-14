window.adstiaScript = {
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
