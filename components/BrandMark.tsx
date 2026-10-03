export default function BrandMark({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <img
      src="/brand-mark.png"
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      className={className}
    />
  );
}
