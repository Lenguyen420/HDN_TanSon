export default function TradeIcon({
  name,
  size = 20,
}: {
  name: "bookmark" | "phone" | "bell" | "pin" | "clock" | "eye" | "share";
  size?: number;
}) {
  const paths = {
    bookmark: "M6 3h12v18l-6-4-6 4V3Z",
    phone:
      "M5 3h4l2 5-3 2a15 15 0 0 0 6 6l2-3 5 2v4c0 2-3 3-5 2C9 19 5 15 3 8 2 5 3 3 5 3Z",
    bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M9 21h6",
    pin: "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM12 7v5",
    clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4v5l4 3",
    eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm10-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z",
    share: "M12 16V2m-5 5 5-5 5 5M5 11H3v10h18V11h-2",
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
