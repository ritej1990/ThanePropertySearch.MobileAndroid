import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from './types';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['thaneproperty://'],
  config: {
    screens: {
      PaymentReturn: {
        path: 'payment-return',
        parse: {
          order_id: (value: string) => value,
        },
      },
    },
  },
};
