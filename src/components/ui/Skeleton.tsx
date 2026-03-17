import { type HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-bmj-tan/10 ${className}`}
      aria-hidden="true"
      {...props}
    />
  );
}

export function SkeletonCard(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="border border-bmj-tan/10 bg-bmj-brown" {...props}>
      <Skeleton className="aspect-[16/9] w-full" />
      <div className="space-y-3 p-6">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex justify-between pt-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonBriefingCard(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="border-l-4 border-bmj-red/30 bg-bmj-brown p-6" {...props}>
      <div className="flex items-center gap-4">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="mt-4 h-8 w-2/3" />
      <Skeleton className="mt-3 h-3 w-full" />
    </div>
  );
}
