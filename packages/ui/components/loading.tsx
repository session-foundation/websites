import { cn } from '../lib/utils';
import './loading.css';

export const Loading = ({ global, absolute }: { global?: boolean; absolute?: boolean }) => {
  return (
    <div
      className={cn(
        'flex items-center justify-center align-center',
        global && 'h-screen w-screen',
        absolute && 'absolute'
      )}
    >
      <div>
        <div className="lds-roller">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </div>
  );
};
