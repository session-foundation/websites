import './loading-text.css';
import { cn } from '../lib/utils';

export const LoadingText = ({ className }: { className?: string }) => {
  return (
    <div className={cn('lds-ellipsis -my-1.5 font-normal text-session-text', className)}>
      <div />
      <div />
      <div />
      <div />
    </div>
  );
};
