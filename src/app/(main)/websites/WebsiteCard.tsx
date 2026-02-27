'use client';
import { Column, Icon, Row, Text } from '@umami/react-zen';
import Link from 'next/link';
import { Favicon } from '@/components/common/Favicon';
import { LinkButton } from '@/components/common/LinkButton';
import { useMessages, useNavigation } from '@/components/hooks';
import type { WebsiteStatsData } from '@/components/hooks/queries/useWebsiteStatsQuery';
import { SquarePen } from '@/components/icons';
import { ChangeLabel } from '@/components/metrics/ChangeLabel';
import { formatLongNumber } from '@/lib/format';

function StatItem({ label, value, change }: { label: string; value: number; change?: number }) {
  const pct =
    change != null && change !== 0 ? Math.abs(Math.round(((value - change) / change) * 100)) : null;
  const diff = change != null ? value - change : null;

  return (
    <Column alignItems="center" gap="1">
      <Text size="5" weight="bold">
        {formatLongNumber(value ?? 0)}
      </Text>
      <Text size="1" color="muted">
        {label}
      </Text>
      <span style={{ fontSize: '10px', lineHeight: 1 }}>
        {diff != null && pct != null ? (
          <ChangeLabel value={diff} size="xs">
            {`${pct}%`}
          </ChangeLabel>
        ) : (
          <ChangeLabel value={0} size="xs">
            {'-'}
          </ChangeLabel>
        )}
      </span>
    </Column>
  );
}

export function WebsiteCard({
  row,
  showActions,
  stats,
}: {
  row: any;
  showActions?: boolean;
  stats?: WebsiteStatsData;
}) {
  const { formatMessage, labels } = useMessages();
  const { renderUrl } = useNavigation();

  return (
    <Column border borderRadius="3" backgroundColor paddingX="6" paddingY="4" gap="4">
      <Row justifyContent="space-between" alignItems="center">
        <Row alignItems="center" gap="3">
          <Icon size="md" color="muted">
            <Favicon domain={row.domain} />
          </Icon>
          <Column gap="1">
            <Link href={renderUrl(`/websites/${row.id}`, false)}>
              <Text weight="bold">{row.name}</Text>
            </Link>
            <Text size="1" color="muted">
              {row.domain}
            </Text>
          </Column>
        </Row>
        {showActions && (
          <LinkButton href={renderUrl(`/websites/${row.id}/settings`)} variant="quiet">
            <Icon>
              <SquarePen />
            </Icon>
          </LinkButton>
        )}
      </Row>
      <Row gap="6" justifyContent="flex-start">
        <StatItem
          label={formatMessage(labels.visitors)}
          value={stats?.visitors ?? 0}
          change={stats?.comparison?.visitors}
        />
        <StatItem
          label={formatMessage(labels.visits)}
          value={stats?.visits ?? 0}
          change={stats?.comparison?.visits}
        />
        <StatItem
          label={formatMessage(labels.views)}
          value={stats?.pageviews ?? 0}
          change={stats?.comparison?.pageviews}
        />
      </Row>
    </Column>
  );
}
