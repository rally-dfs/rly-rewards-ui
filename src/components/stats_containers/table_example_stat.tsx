import React from 'react';
import { StatElement } from '../../types/stat_element';

import Card from '../card';
import DataTable from '../metric_ui_elements/data_table';
import MetricHeader from '../metric_ui_elements/metric_header';

const TableExampleStat = (props: StatElement) => {
  if (!props.data) return null;
  const tableData: Record<string, string>[] =
    props.data.tbc_balances_by_account['1'];

  return (
    <Card>
      <MetricHeader title="TBC Balances By Account: 1" />
      <DataTable data={tableData} />
    </Card>
  );
};

export default TableExampleStat;
