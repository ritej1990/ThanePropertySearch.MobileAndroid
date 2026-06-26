import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { PlanSlider } from '../src/components/ui/PlanSlider';

async function setup(value: number, props: Partial<React.ComponentProps<typeof PlanSlider>> = {}) {
  const onChange = jest.fn();
  await render(
    <PlanSlider
      label="Total properties"
      icon="business-outline"
      value={value}
      min={1}
      max={50}
      increment={1}
      valueLabel={String(value)}
      minLabel="1"
      maxLabel="50 max"
      onChange={onChange}
      {...props}
    />
  );
  return { onChange };
}

describe('PlanSlider actions', () => {
  it('renders the current value', async () => {
    await setup(5);
    expect(screen.getByText('5')).toBeTruthy();
  });

  it('increments when + is pressed', async () => {
    const { onChange } = await setup(5);
    fireEvent.press(screen.getByLabelText('Increase Total properties'));
    expect(onChange).toHaveBeenCalledWith(6);
  });

  it('decrements when − is pressed', async () => {
    const { onChange } = await setup(5);
    fireEvent.press(screen.getByLabelText('Decrease Total properties'));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('clamps at the maximum', async () => {
    const { onChange } = await setup(50);
    fireEvent.press(screen.getByLabelText('Increase Total properties'));
    expect(onChange).toHaveBeenCalledWith(50);
  });

  it('clamps at the minimum', async () => {
    const { onChange } = await setup(1);
    fireEvent.press(screen.getByLabelText('Decrease Total properties'));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('respects a custom increment (leads step of 5)', async () => {
    const { onChange } = await setup(10, {
      label: 'Total leads',
      min: 0,
      max: 200,
      increment: 5,
      maxLabel: '₹25 each',
    });
    fireEvent.press(screen.getByLabelText('Increase Total leads'));
    expect(onChange).toHaveBeenCalledWith(15);
  });
});
