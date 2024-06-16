// remove disabled for now its added because there are no pages for that route

export const ROUTES = [
  {
    title: "Getting Started",
    href: "getting-started",
    items: [
      {
        title: "Introduction",
        href: "/introduction",
      },
      {
        title: "Installation",
        href: "/installation",
      },
      {
        title: "components.json",
        href: "/components-json",
      },
      {
        title: "Project Structure",
        href: "/project-structure",
        disabled: true,
      },
      {
        title: "Theming",
        href: "/theming",
        disabled: true,
      },
      {
        title: "Typography",
        href: "/typography",
        disabled: true,
      },
      {
        title: "Changelog",
        href: "/changelog",
        disabled: true,
      },
    ],
  },
  {
    title: "Components",
    href: "components",
    items: [
      {
        title: "Accordian",
        href: "/accordian",
      },
      {
        title: "Alert Dialog",
        href: "/alert-dialog",
        disabled: true,
      },
      {
        title: "Breadcrumb",
        href: "/breadcrumb",
        disabled: true,
      },
      {
        title: "Button",
        href: "/button",
        disabled: true,
      },
      {
        title: "Context Menu",
        href: "/context-menu",
        disabled: true,
      },
      {
        title: "Data Table",
        href: "/data-table",
        disabled: true,
      },
      {
        title: "Date Picker",
        href: "/date-picker",
        disabled: true,
      },
      {
        title: "Dialog",
        href: "/dialog",
        disabled: true,
      },
      {
        title: "Dropdown Menu",
        href: "/dropdown-menu",
        disabled: true,
      },
      {
        title: "Form",
        href: "/form",
        disabled: true,
      },
      {
        title: "Hover Card",
        href: "/hover-card",
        disabled: true,
      },
      {
        title: "Input",
        href: "/input",
        disabled: true,
      },
      {
        title: "Input OTP",
        href: "/input-otp",
        disabled: true,
      },
      {
        title: "Label",
        href: "/label",
        disabled: true,
      },
      {
        title: "Menubar",
        href: "/menubar",
        disabled: true,
      },
      {
        title: "Navigation Menu",
        href: "/navigation-menu",
        disabled: true,
      },
      {
        title: "Pagination",
        href: "/pagination",
        disabled: true,
      },
      {
        title: "Radio Group",
        href: "/radio-group",
        disabled: true,
      },
      {
        title: "Resizable",
        href: "/resizable",
        disabled: true,
      },
      {
        title: "Scroll Area",
        href: "/scroll-area",
        disabled: true,
      },
      {
        title: "Toast",
        href: "/toast",
        disabled: true,
      },
    ],
  },
];

export const FLATTEND_ROUTES = ROUTES.map(({ href, items }) => {
  return items.map((link) => {
    return {
      title: link.title,
      href: href + link.href,
      disabled: link.disabled,
    };
  });
}).flat();
