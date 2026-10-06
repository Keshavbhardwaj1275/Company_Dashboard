import React from 'react';

interface MiniBarSparklineProps {
  type?: 'bars' | 'bell' | 'heat-grid';
  values?: number[];
  height?: number;
  highlightIndex?: number;
}

export const MiniBarSparkline: React.FC<MiniBarSparklineProps> = ({
  type = 'bars',
  values = [40, 65, 55, 80, 70, 90, 85, 95, 60, 92, 45, 88],
  height = 20,
  highlightIndex = 10,
}) => {
  if (type === 'heat-grid') {
    // 6x3 mini dotted heat-matrix grid
    const dots = [
      [1, 2, 3, 2, 3, 3],
      [2, 3, 3, 1, 2, 3],
      [3, 2, 1, 3, 3, 2],
    ];

    const getOpacity = (val: number) => {
      if (val === 1) return 'bg-[#288F3D]/25 dark:bg-[#34D399]/25';
      if (val === 2) return 'bg-[#288F3D]/60 dark:bg-[#34D399]/60';
      return 'bg-[#288F3D] dark:bg-[#34D399]';
    };

    return (
      <div className="flex flex-col gap-[3px] py-0.5">
        {dots.map((row, rIdx) => (
          <div key={rIdx} className="flex gap-[3px]">
            {row.map((val, cIdx) => (
              <span
                key={cIdx}
                className={`w-[4px] h-[4px] rounded-[1px] ${getOpacity(val)}`}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (type === 'bell') {
    // Bell curve mound distribution
    const bellValues = [15, 30, 55, 85, 100, 85, 55, 30, 15];
    return (
      <div className="flex items-end gap-[2.5px]" style={{ height }}>
        {bellValues.map((v, i) => (
          <div
            key={i}
            className="w-[3px] rounded-t-sm bg-[#158AF4] dark:bg-[#38BDF8]"
            style={{
              height: `${(v / 100) * height}px`,
              opacity: i === 4 ? 1 : 0.45 + (v / 200),
            }}
          />
        ))}
      </div>
    );
  }

  // Standard thin 3px bar sparkline with outlier color
  return (
    <div className="flex items-end gap-[3px]" style={{ height }}>
      {values.map((v, i) => {
        const isOutlier = i === highlightIndex;
        return (
          <div
            key={i}
            className={`w-[3px] rounded-t-sm transition-all ${
              isOutlier
                ? 'bg-[#F3740F] dark:bg-[#FB923C]'
                : 'bg-[#288F3D] dark:bg-[#34D399]'
            }`}
            style={{
              height: `${Math.max(3, (v / 100) * height)}px`,
              opacity: isOutlier ? 1 : 0.35 + (v / 180),
            }}
          />
        );
      })}
    </div>
  );
};
