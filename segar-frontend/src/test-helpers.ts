/**
 * Helper functions to make Jasmine tests compatible with Jest
 */

// Type for spy objects
export type SpyObj<T> = T & {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? jest.Mock : T[K];
};

// Helper to create spy objects similar to jasmine.createSpyObj
export function createSpyObj<T>(baseName: string, methodNames: (keyof T)[]): SpyObj<T> {
  const obj: any = {};
  
  for (const method of methodNames) {
    obj[method] = jest.fn();
  }
  
  return obj as SpyObj<T>;
}

// Re-export commonly used test utilities
export { TestBed, ComponentFixture } from '@angular/core/testing';
