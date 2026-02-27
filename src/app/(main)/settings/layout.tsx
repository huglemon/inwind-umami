import type { Metadata } from 'next';
import { SettingsLayout } from './SettingsLayout';

export default function ({ children }) {
  if (process.env.cloudMode) {
    return null;
  }

  return <SettingsLayout>{children}</SettingsLayout>;
}

export const metadata: Metadata = {
  title: {
    template: '%s | 设置 | 乘风出海',
    default: '设置 | 乘风出海',
  },
};
