import React from 'react';

import TableStyles from '../styles/table.module.css';

const DataTable = ({ data }: { data: Record<string, string>[] }) => {
  return (
    <div className={TableStyles.table_container}>
      {data.map((entry) => (
        <TableRow rowData={entry} />
      ))}
    </div>
  );
};

const TableRow = ({ rowData }: { rowData: Record<string, string> }) => {
  const attributes = Object.values(rowData);
  return (
    <div key={attributes[0]} className={TableStyles.table_row}>
      {attributes.map((attribute) => (
        <div
          style={{ width: `${100 / attributes.length}%` }}
          className={TableStyles.table_cell}>
          {attribute}
        </div>
      ))}
    </div>
  );
};

export default DataTable;
