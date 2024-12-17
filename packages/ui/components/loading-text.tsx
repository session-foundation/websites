import './loading-text.css';
import { cn } from '../lib/utils';

export const LoadingText = ({ className }: { className?: string }) => {
  return (
    <div className={cn('lds-ellipsis text-session-text -my-1.5 font-normal', className)}>
      <div />
      <div />
      <div />
      <div />
    </div>
  );
};
