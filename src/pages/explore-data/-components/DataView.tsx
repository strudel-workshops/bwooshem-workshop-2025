import { Alert, Box, LinearProgress, Skeleton } from '@mui/material';
import { GridPaginationModel, GridColDef } from '@mui/x-data-grid';
import React, { useState, useEffect } from 'react';
import { useFilters } from '../../../components/FilterContext';
import { SciDataGrid } from '../../../components/SciDataGrid';
import { filterData } from '../../../utils/filters.utils';
import { useListQuery } from '../../../hooks/useListQuery';
import { FilterConfig } from '../../../types/filters.types';
import { AppLink } from '../../../components/AppLink';
import { csv } from 'd3-fetch';
import { cleanPath } from '../../../utils/queryParams.utils';

interface DataViewProps {
  filterConfigs: FilterConfig[];
  searchTerm: string;
  setPreviewItem: React.Dispatch<React.SetStateAction<any>>;
}
/**
 * Query the data rows and render as an interactive table
 */
export const DataView: React.FC<DataViewProps> = ({
  filterConfigs,
  searchTerm,
  setPreviewItem,
}) => {
  const { activeFilters } = useFilters();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [offset, setOffest] = useState(page * pageSize);
  const [averages, setAverages] = useState<Record<string, number>>({});
  const [loadingAverages, setLoadingAverages] = useState(false);
  // CUSTOMIZE: the unique ID field for the data source
  const dataIdField = 'name';
  // CUSTOMIZE: query mode, 'client' or 'server'
  const queryMode = 'client';
  const { isPending, isFetching, isError, data, error } = useListQuery({
    activeFilters,
    // CUSTOMIZE: the table data source
    dataSource: 'dummy-data/file-entities.json',
    filterConfigs,
    offset,
    page,
    pageSize,
    queryMode,
    staticParams: null,
  });

  // Load CSV statistics for all files to calculate averages
  useEffect(() => {
    if (!data || data.length === 0) return;

    const loadAverages = async () => {
      setLoadingAverages(true);
      const base = document.querySelector('base')?.getAttribute('href') ?? '';
      const basePath = import.meta.env.VITE_BASE_URL || '';
      const leadingSlash = basePath ? '/' : '';
      const basename = cleanPath(leadingSlash + base + basePath);

      const newAverages: Record<string, number> = {};

      await Promise.all(
        data.map(async (entity: any) => {
          try {
            const dataPath = `${basename}/data/${entity.name}.csv`;
            const csvData = await csv(dataPath);

            if (csvData && csvData.length > 0) {
              const priceColumn = Object.keys(csvData[0])[1]; // Second column "Price ($/kWh)"
              const prices: number[] = [];

              csvData.forEach((row) => {
                const price = parseFloat(row[priceColumn]);
                if (!isNaN(price)) {
                  prices.push(price);
                }
              });

              if (prices.length > 0) {
                const sum = prices.reduce((acc, val) => acc + val, 0);
                const average = sum / prices.length;
                newAverages[entity.name] = Math.round(average * 10000) / 10000;
              }
            }
          } catch (err) {
            // Silently ignore errors when loading CSV files
          }
        })
      );

      setAverages(newAverages);
      setLoadingAverages(false);
    };

    loadAverages();
  }, [data]);

  const handleRowClick = (rowData: any) => {
    setPreviewItem(rowData.row);
  };

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    // Reset page to first when the page size changes
    const newPage = model.pageSize !== pageSize ? 0 : model.page;
    const newPageSize = model.pageSize;
    const newOffset = newPage * newPageSize;
    setPage(newPage);
    setPageSize(newPageSize);
    setOffest(newOffset);
  };

  // Show a loading skeleton while the initial query is pending
  if (isPending) {
    const emptyRows = new Array(pageSize).fill(null);
    const indexedRows = emptyRows.map((row, i) => i);
    return (
      <Box
        sx={{
          padding: 2,
        }}
      >
        {indexedRows.map((row) => (
          <Skeleton key={row} height={50} />
        ))}
      </Box>
    );
  }

  // Show an error message if the query fails
  if (isError) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  // Define columns with custom rendering for the name field
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      width: 300,
      renderCell: (params) => (
        <AppLink to="/explore-data/$id" params={{ id: params.value }}>
          {params.value}.csv
        </AppLink>
      ),
    },
    {
      field: 'average',
      headerName: 'Average',
      width: 200,
      valueGetter: (value, row) => {
        return averages[row.name] !== undefined ? averages[row.name] : '';
      },
    },
  ];

  // Show the data when the query completes
  return (
    <>
      {(isFetching || loadingAverages) && (
        <LinearProgress variant="indeterminate" />
      )}
      <SciDataGrid
        rows={filterData(data, activeFilters, filterConfigs, searchTerm)}
        pagination
        paginationMode={queryMode}
        onPaginationModelChange={handlePaginationModelChange}
        getRowId={(row) => row[dataIdField]}
        // CUSTOMIZE: the table columns
        columns={columns}
        disableColumnSelector
        autoHeight
        initialState={{
          pagination: { paginationModel: { page, pageSize } },
        }}
        onRowClick={handleRowClick}
      />
    </>
  );
};
