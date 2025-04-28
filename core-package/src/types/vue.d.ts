declare module 'vue' {
  export interface Ref<T> {
    value: T;
  }

  export function ref<T>(value: T): Ref<T>;
  export function computed<T>(getter: () => T): Ref<T>;
} 