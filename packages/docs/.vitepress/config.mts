import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Petboarding",
  head: [["link", { rel: "icon", href: "/favicon.ico" }]],
  description: "Ease the administration of your pet boarding business.",
  locales: {
    root: {
      label: "English",
      lang: "en",
      themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
          { text: "Home", link: "/" },
          { text: "Demo", link: "/demo" },
          { text: "Contact", link: "/contact" },
          { text: "Documentation", link: "/documentation" },
        ],
      },
    },
    nl: {
      label: "Nederlands",
      lang: "nl", // optional, will be added  as `lang` attribute on `html` tag
      link: "/nl", // default /fr/ -- shows on navbar translations menu, can be external
      themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
          { text: "Home", link: "/nl" },
          { text: "Demo", link: "/nl/demo" },
          { text: "Contact", link: "/nl/contact" },
          { text: "Documentatie", link: "/nl/documentation" },
        ],
      },
      // other locale specific properties...
    },
  },

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    // nav: [
    //   { text: "Home", link: "/" },
    //   { text: "Demo", link: "/demo" },
    //   { text: "Contact", link: "/contact" },
    // ],

    socialLinks: [
      { icon: "github", link: "https://github.com/simsustech/petboarding" },
    ],
  },
});
