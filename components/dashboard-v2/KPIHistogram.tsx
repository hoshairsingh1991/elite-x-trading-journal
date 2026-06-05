type KPIHistogramProps = {
  data: number[];
};

export default function KPIHistogram({
  data,
}: KPIHistogramProps) {

  if (data.length < 2) {
    return null;
  }

  const max =
    Math.max(...data);

  return (
    <div
      className="
        absolute
        bottom-2
        left-0
        right-0
        flex
        h-[48px]
        items-end
        gap-[2px]
        px-3
      "
    >
      {data.map(
        (value, index) => {

          const height =
            Math.max(
              4,
              (value / max) * 100
            );

          return (
            <div
              key={index}
              className="
                flex-1
                rounded-t-[1px]
                bg-violet-500/45
              "
              style={{
                height: `${height}%`,
              }}
            />
          );
        }
      )}
    </div>
  );
}