import { type NavItem } from "@ariadocs/react";

export default function NavList({ items }: { items: NavItem[] }) {
  return (
    <ul>
      {items
        .filter((item) => item.nav)
        .map((item) => (
          <li key={item.href}>
            <a href={"/docs" + item.href}>{item.title}</a>
            {item.items.length > 0 && <NavList items={item.items} />}
          </li>
        ))}
    </ul>
  );
}
