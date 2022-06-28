import React, { useEffect, useRef, useState } from 'react';
import { Line, LineChart } from 'recharts';

type BasicLineGraphProps = {
  data: { x: string | number; y: number }[];
};
const BasicLineGraph = ({ data }: BasicLineGraphProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [graphSize, setGraphSize] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (!chartContainerRef.current) {
      return;
    }

    setGraphSize({
      x: chartContainerRef.current.offsetWidth,
      y: chartContainerRef.current.offsetHeight,
    });
  }, [chartContainerRef]);

  return (
    <div style={{ width: '100%', height: 300 }} ref={chartContainerRef}>
      <LineChart width={graphSize.x} height={graphSize.y} data={data}>
        <Line type="monotone" dataKey="y" stroke="#F2550A" strokeWidth={2} />
      </LineChart>
    </div>
  );
};

export default BasicLineGraph;