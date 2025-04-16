import { TriangleAlertIcon } from '@session/ui/icons/TriangleAlertIcon';
import { Button } from '@session/ui/ui/button';
import type { ReactNode } from 'react';

export function ErrorMessage({
  refetch,
  buttonText,
  buttonDataTestId,
  message,
}: {
  refetch: () => void;
  buttonText?: string;
  buttonDataTestId: `button:${string}`;
  message?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <TriangleAlertIcon className="h-16 w-16 stroke-warning" />
      <p>{message}</p>
      <Button data-testid={buttonDataTestId} rounded="md" size="lg" onClick={refetch}>
        {buttonText}
      </Button>
    </div>
  );
}
