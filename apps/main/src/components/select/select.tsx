import Check from '@geist-ui/react-icons/check';
import ChevronDownCircleFill from '@geist-ui/react-icons/chevronDownCircleFill';
import { Listbox } from '@headlessui/react';
import clsx from 'clsx';
import { AnimatePresence, m } from 'framer-motion';
import * as React from 'react';

import { listHoverable, cardBg } from '$/styles/common';

import { easeInOut } from '../animation';
import styles from './select.module.scss';

export type SelectProps<T> = React.PropsWithChildren<{
  name?: string;
  value: T;
  onChange(value: T): void;
  label?: string;
  className?: string;
}>;

export function Select<T extends string | number = string>({
  name,
  value,
  children,
  onChange,
  label,
  className,
}: SelectProps<T>): JSX.Element {
  return (
    <Listbox value={value} onChange={onChange}>
      {({ open }) => (
        <div className="text-gray-1100">
          {label && (
            <Listbox.Label className={`mb-1 block text-sm font-bold`}>{label}</Listbox.Label>
          )}
          <div className={clsx(`relative`, className)}>
            <span className={`inline-block w-full`}>
              <Listbox.Button
                className={`relative w-full cursor-default rounded border border-transparent py-2 pl-3 pr-8 text-left transition duration-150 ease-in-out hover:border-primary-700 focus-visible:outline-none focus-visible:ring-primary-700`}
              >
                <span>{name || value}</span>
                <span
                  className={clsx(
                    'pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-300',
                    styles.icon,
                  )}
                >
                  <ChevronDownCircleFill size={18} />
                </span>
              </Listbox.Button>
            </span>
            <AnimatePresence>
              {open && (
                <m.div
                  {...easeInOut}
                  className={clsx('absolute z-20 mt-1 w-full rounded-md shadow-lg', cardBg)}
                >
                  <Listbox.Options
                    static
                    className="max-h-60 overflow-auto overscroll-contain rounded-sm border border-gray-400 py-1 px-0.5 text-base focus-visible:outline-none sm:text-sm"
                  >
                    {children}
                  </Listbox.Options>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </Listbox>
  );
}

Select.Option = SelectOption;

type SelectOptionProps<T> = {
  children: React.ReactNode;
  value: T;
};

function SelectOption<T>({ value, children }: SelectOptionProps<T>): JSX.Element {
  return (
    <Listbox.Option key={String(value)} value={value as $TsFixMe}>
      {/* active includes hover event */}
      {({ selected, active }) => (
        <div
          className={clsx(
            active && listHoverable,
            `relative cursor-pointer select-none py-2 pl-7 pr-4 text-gray-1100`,
          )}
        >
          <span className="block">{children}</span>
          {selected && (
            <span
              className={clsx(
                active && listHoverable,
                `absolute inset-y-0 left-0 flex items-center pl-1.5`,
              )}
            >
              <Check size={16} />
            </span>
          )}
        </div>
      )}
    </Listbox.Option>
  );
}
