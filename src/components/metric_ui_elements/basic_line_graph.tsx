import React, { useEffect, useRef, useState } from 'react';
import { Line, LineChart, YAxis } from 'recharts';

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
        <YAxis hide={true} domain={['dataMin - 10000000', 'dataMax']} />
        <Line
          type="monotone"
          dataKey="y"
          stroke="#CEFF44"
          strokeWidth={1}
          dot={false}
        />
      </LineChart>
    </div>
  );
};

export default BasicLineGraph;
