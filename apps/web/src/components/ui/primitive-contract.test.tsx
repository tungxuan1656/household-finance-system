import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Alert } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupInput } from '@/components/ui/input-group'
import { NativeSelect } from '@/components/ui/native-select'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

HTMLElement.prototype.scrollIntoView ??= () => {}

describe('primitive variant contracts', () => {
  it('applies card surface and size presets', () => {
    render(
      <Card data-testid='card' size='sm' surface='outline' variant='default' />,
    )

    const card = screen.getByTestId('card')

    expect(card).toHaveAttribute('data-size', 'sm')
    expect(card).toHaveAttribute('data-surface', 'outline')
    expect(card.className).toContain('bg-transparent')
    expect(card.className).toContain('shadow-none')
  })

  it('applies input, textarea, input-group, and native-select size and variant presets', () => {
    render(
      <>
        <Input data-testid='input' size='lg' variant='ghost' />
        <Textarea data-testid='textarea' size='sm' variant='ghost' />
        <InputGroup data-testid='group' size='sm' variant='ghost'>
          <InputGroupInput />
        </InputGroup>
        <NativeSelect data-testid='native-select' size='sm' variant='ghost'>
          <option value='cash'>Cash</option>
        </NativeSelect>
      </>,
    )

    expect(screen.getByTestId('input')).toHaveAttribute('data-size', 'lg')
    expect(screen.getByTestId('input')).toHaveAttribute('data-variant', 'ghost')
    expect(screen.getByTestId('input').className).toContain('bg-transparent')

    expect(screen.getByTestId('textarea')).toHaveAttribute('data-size', 'sm')

    expect(screen.getByTestId('textarea')).toHaveAttribute(
      'data-variant',
      'ghost',
    )

    expect(screen.getByTestId('group')).toHaveAttribute('data-size', 'sm')
    expect(screen.getByTestId('group')).toHaveAttribute('data-variant', 'ghost')

    expect(screen.getByTestId('native-select')).toHaveAttribute(
      'data-size',
      'sm',
    )

    expect(screen.getByTestId('native-select')).toHaveAttribute(
      'data-variant',
      'ghost',
    )

    expect(screen.getByTestId('group').className).toContain('w-full')
  })

  it('keeps invalid and disabled state affordances on text controls', () => {
    render(
      <>
        <Input aria-invalid disabled data-testid='invalid-input' />
        <Textarea aria-invalid disabled data-testid='invalid-textarea' />
      </>,
    )

    expect(screen.getByTestId('invalid-input').className).toContain(
      'aria-invalid:border-destructive',
    )

    expect(screen.getByTestId('invalid-input').className).toContain(
      'disabled:pointer-events-none',
    )

    expect(screen.getByTestId('invalid-textarea').className).toContain(
      'aria-invalid:border-destructive',
    )

    expect(screen.getByTestId('invalid-textarea').className).toContain(
      'disabled:opacity-50',
    )
  })

  it('aligns selection-family trigger geometry across select, native-select, and combobox', () => {
    render(
      <>
        <Select defaultOpen>
          <SelectTrigger data-testid='trigger' size='lg' variant='ghost'>
            <SelectValue placeholder='Choose one' />
          </SelectTrigger>
          <SelectContent data-testid='content' surface='outline'>
            <SelectItem value='one'>One</SelectItem>
          </SelectContent>
        </Select>
        <NativeSelect data-testid='aligned-native-select' size='lg'>
          <option value='cash'>Cash</option>
        </NativeSelect>
        <Combobox defaultOpen items={['one']}>
          <ComboboxInput data-testid='combobox-input' size='lg' />
          <ComboboxContent data-testid='combobox-content' surface='outline'>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </>,
    )

    const trigger = screen.getByTestId('trigger')
    const content = screen.getByTestId('content')
    const nativeSelect = screen.getByTestId('aligned-native-select')
    const comboboxInput = screen.getByTestId('combobox-input')

    expect(trigger).toHaveAttribute('data-size', 'lg')
    expect(trigger).toHaveAttribute('data-variant', 'ghost')
    expect(trigger.className).toContain('bg-transparent')
    expect(trigger.className).toContain('w-full')

    expect(nativeSelect.className).toContain('w-full')

    expect(
      comboboxInput.closest('[data-slot="input-group"]')?.className,
    ).toContain('w-full')

    expect(content).toHaveAttribute('data-surface', 'outline')
    expect(content.className).toContain('shadow-none')

    expect(screen.getByTestId('combobox-content').className).toContain(
      'shadow-none',
    )
  })

  it('uses canonical overlay blur and shared surface contracts for dialog and drawer', () => {
    render(
      <>
        <Dialog open>
          <DialogContent data-testid='dialog-content' size='lg' surface='solid'>
            <DialogTitle>Dialog title</DialogTitle>
            <DialogDescription>Dialog description</DialogDescription>
          </DialogContent>
        </Dialog>
        <Drawer open>
          <DrawerContent
            data-testid='drawer-content'
            size='lg'
            surface='solid'
          />
        </Drawer>
      </>,
    )

    expect(screen.getByTestId('dialog-content')).toHaveAttribute(
      'data-size',
      'lg',
    )

    expect(screen.getByTestId('dialog-content')).toHaveAttribute(
      'data-surface',
      'solid',
    )

    expect(screen.getByTestId('dialog-content').className).toContain(
      'bg-popover',
    )

    expect(
      screen.getByTestId('dialog-content').previousElementSibling?.className,
    ).toContain('supports-backdrop-filter:backdrop-blur-xl')

    expect(screen.getByTestId('drawer-content')).toHaveAttribute(
      'data-size',
      'lg',
    )

    expect(screen.getByTestId('drawer-content')).toHaveAttribute(
      'data-surface',
      'solid',
    )

    expect(screen.getByTestId('drawer-content').className).toContain(
      'before:bg-popover',
    )

    expect(
      screen.getByTestId('drawer-content').previousElementSibling?.className,
    ).toContain('supports-backdrop-filter:backdrop-blur-xl')
  })

  it('supports alert tones without relying on the legacy variant name', () => {
    render(<Alert data-testid='alert' tone='warning' />)

    const alert = screen.getByTestId('alert')

    expect(alert).toHaveAttribute('data-tone', 'warning')
    expect(alert.className).toContain('text-status-warning-foreground')
  })

  it('applies empty surface presets with layout-only consumer classes preserved', () => {
    render(
      <Empty className='min-h-32' data-testid='empty' surface='outline'>
        <EmptyHeader>
          <EmptyMedia variant='icon'>icon</EmptyMedia>
          <EmptyTitle>Empty title</EmptyTitle>
          <EmptyDescription>Empty description</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>Action</EmptyContent>
      </Empty>,
    )

    const empty = screen.getByTestId('empty')

    expect(empty).toHaveAttribute('data-surface', 'outline')
    expect(empty.className).toContain('border-dashed')
    expect(empty.className).toContain('min-h-32')
  })
})
