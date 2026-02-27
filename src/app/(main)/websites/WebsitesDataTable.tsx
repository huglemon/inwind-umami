'use client';
import { useQueries } from '@tanstack/react-query';
import { Button, Grid, Row } from '@umami/react-zen';
import { useMemo, useState } from 'react';
import { DataGrid } from '@/components/common/DataGrid';
import { useApi, useLoginQuery, useTimezone, useUserWebsitesQuery } from '@/components/hooks';
import { WebsiteCard } from './WebsiteCard';

type Period = '24h' | '7d';
type SortBy = 'default' | 'visitors' | 'views';

function WebsiteCardGrid({
  data,
  showActions,
  period,
  sortBy,
  displayMode: _,
}: {
  data: any[];
  showActions?: boolean;
  period: Period;
  sortBy: SortBy;
  displayMode?: any;
}) {
  const { get } = useApi();
  const { timezone, canonicalizeTimezone } = useTimezone();

  const { startAt, endAt } = useMemo(() => {
    const end = Date.now();
    const start = period === '7d' ? end - 7 * 24 * 60 * 60 * 1000 : end - 24 * 60 * 60 * 1000;
    return {
      startAt: Math.floor(start / 3600000) * 3600000,
      endAt: Math.ceil(end / 3600000) * 3600000,
    };
  }, [period]);

  const statsResults = useQueries({
    queries: (data ?? []).map((website: any) => ({
      queryKey: ['websites:stats:card', { websiteId: website.id, startAt, endAt, period }],
      queryFn: () =>
        get(`/websites/${website.id}/stats`, {
          startAt,
          endAt,
          timezone: canonicalizeTimezone(timezone),
        }),
      enabled: !!website.id,
    })),
  });

  const statsMap = useMemo(
    () =>
      Object.fromEntries(
        (data ?? []).map((website: any, i: number) => [website.id, statsResults[i]?.data]),
      ),
    [data, statsResults],
  );

  const sortedData = useMemo(() => {
    const arr = [...(data ?? [])];
    if (sortBy === 'visitors') {
      arr.sort((a, b) => (statsMap[b.id]?.visitors ?? 0) - (statsMap[a.id]?.visitors ?? 0));
    } else if (sortBy === 'views') {
      arr.sort((a, b) => (statsMap[b.id]?.pageviews ?? 0) - (statsMap[a.id]?.pageviews ?? 0));
    }
    return arr;
  }, [data, sortBy, statsMap]);

  return (
    <Grid columns="repeat(auto-fill, minmax(320px, 1fr))" gap="4">
      {sortedData.map((row: any) => (
        <WebsiteCard key={row.id} row={row} showActions={showActions} stats={statsMap[row.id]} />
      ))}
    </Grid>
  );
}

export function WebsitesDataTable({
  userId,
  teamId,
  showActions = true,
}: {
  userId?: string;
  teamId?: string;
  allowEdit?: boolean;
  allowView?: boolean;
  showActions?: boolean;
}) {
  const { user } = useLoginQuery();
  const [period, setPeriod] = useState<Period>('24h');
  const [sortBy, setSortBy] = useState<SortBy>('default');
  const queryResult = useUserWebsitesQuery({ userId: userId || user?.id, teamId });

  const renderActions = () => (
    <Row gap="3" alignItems="center">
      <Row gap="1">
        <Button
          size="sm"
          variant={period === '24h' ? 'primary' : 'outline'}
          onPress={() => setPeriod('24h')}
        >
          24小时
        </Button>
        <Button
          size="sm"
          variant={period === '7d' ? 'primary' : 'outline'}
          onPress={() => setPeriod('7d')}
        >
          7天
        </Button>
      </Row>
      <Row gap="1">
        <Button
          size="sm"
          variant={sortBy === 'default' ? 'primary' : 'outline'}
          onPress={() => setSortBy('default')}
        >
          默认
        </Button>
        <Button
          size="sm"
          variant={sortBy === 'visitors' ? 'primary' : 'outline'}
          onPress={() => setSortBy('visitors')}
        >
          访客↓
        </Button>
        <Button
          size="sm"
          variant={sortBy === 'views' ? 'primary' : 'outline'}
          onPress={() => setSortBy('views')}
        >
          浏览↓
        </Button>
      </Row>
    </Row>
  );

  return (
    <DataGrid query={queryResult} allowSearch allowPaging renderActions={renderActions}>
      {({ data }) => (
        <WebsiteCardGrid data={data} showActions={showActions} period={period} sortBy={sortBy} />
      )}
    </DataGrid>
  );
}
