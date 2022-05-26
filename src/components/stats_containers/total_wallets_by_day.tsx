import React, { useEffect, useRef, useState } from 'react';
import { Line, LineChart } from 'recharts';
import Card from '../card';
import MetricHeader from '../metric_header';

type TotalWalletsByDayProps = {
  data: any;
};

const TotalWalletsByDay = ({ data }: TotalWalletsByDayProps) => {
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

  if (!data) {
    return null;
  }
  const walletCountsByDayByToken: Record<
    number,
    Record<string, number>
  > = data.non_zero_balances_by_mint;

  const allWallCountsByDayUnAggregated = Object.entries(
    walletCountsByDayByToken,
  )
    .map(([k, mintByDay]) => Object.entries(mintByDay))
    .flat();

  const allNonZeroBalanceByDay = allWallCountsByDayUnAggregated.reduce(
    (totals: Record<string, number>, [day, count]) => {
      const existingCount = totals[day] || 0;
      return Object.assign(totals, { [day]: existingCount + count });
    },
    {},
  );

  const dataToGraph = Object.entries(allNonZeroBalanceByDay)
    .map(([day, count]) => ({ x: day, y: count }))
    .sort((a, b) => {
      if (a.x > b.x) {
        return 1;
      }
      return -1;
    });

  return (
    <Card>
      <MetricHeader title="Total Non Zero Wallets" />
      <div style={{ width: '100%', height: 300 }} ref={chartContainerRef}>
        <LineChart width={graphSize.x} height={graphSize.y} data={dataToGraph}>
          <Line type="monotone" dataKey="y" stroke="#F2550A" strokeWidth={2} />
        </LineChart>
      </div>
    </Card>
  );
};

export default TotalWalletsByDay;
