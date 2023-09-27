"use client";

export default function ScrollTop() {
  function OnClick() {
    window.scrollTo(0, 0);
  }
  return (
    <span onClick={OnClick} className="cursor-pointer">
      Scroll to top
    </span>
  );
}
