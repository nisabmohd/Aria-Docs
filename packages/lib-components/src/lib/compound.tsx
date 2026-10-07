/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ComponentProps, ComponentType, JSX } from "react"

/**
 * Attach compound parts (`Operation.Header`, ...) to a component in a way
 * that works in React Server Components.
 *
 * On the server, components from `"use client"` modules are opaque client
 * references: properties can't be read from or assigned to them. So instead
 * of mutating the client component, this wraps it in a plain function
 * component (fine on both sides) and attaches the parts to the wrapper.
 */
export function compound<C extends ComponentType<any>, P extends Record<string, unknown>>(
  Component: C,
  parts: P,
  displayName: string
): ((props: ComponentProps<C>) => JSX.Element) & P {
  function Compound(props: ComponentProps<C>) {
    return <Component {...props} />
  }
  Compound.displayName = displayName
  return Object.assign(Compound, parts)
}
