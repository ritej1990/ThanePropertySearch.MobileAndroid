import React, { forwardRef } from 'react';
import { Animated, FlatList, type FlatListProps } from 'react-native';

const InnerAnimatedFlatList = Animated.createAnimatedComponent(FlatList);

/** FlatList wrapper required for `Animated.event` scroll handlers with `useNativeDriver: true`. */
export const AnimatedFlatList = forwardRef(function AnimatedFlatList<ItemT>(
  props: FlatListProps<ItemT>,
  ref: React.Ref<FlatList<ItemT>>
) {
  return (
    <InnerAnimatedFlatList
      {...(props as React.ComponentProps<typeof InnerAnimatedFlatList>)}
      ref={ref as React.ComponentProps<typeof InnerAnimatedFlatList>['ref']}
    />
  );
}) as <ItemT>(
  props: FlatListProps<ItemT> & React.RefAttributes<FlatList<ItemT>>
) => React.ReactElement;
