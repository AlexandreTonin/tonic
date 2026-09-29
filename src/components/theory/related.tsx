import type { ReactNode } from 'react';

type RelatedProps = {
  title: string;
  isEmpty?: boolean;
  empty?: string;
  children: ReactNode;
};

export function Related({ title, isEmpty, empty, children }: RelatedProps) {
  return (
    <section className="flex flex-col gap-3 border-t pt-6">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {isEmpty ? <p className="text-muted-foreground">{empty}</p> : children}
    </section>
  );
}

export function LinkRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 [&_a]:underline-offset-4 [&_a:hover]:underline">
      {children}
    </div>
  );
}
