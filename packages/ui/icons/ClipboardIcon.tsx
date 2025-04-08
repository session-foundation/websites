import { forwardRef } from 'react';
import { SVGAttributes } from './types';

export const ClipboardIcon = forwardRef<SVGSVGElement, SVGAttributes>((props, ref) => (
  <svg viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
    <g id="copy">
      <path id="Vector (Stroke)" fill-rule="evenodd" clip-rule="evenodd" d="M9.99976 9.50008C9.44747 9.50008 8.99976 9.94779 8.99976 10.5001V20.5001C8.99976 21.0524 9.44747 21.5001 9.99976 21.5001H19.9998C20.552 21.5001 20.9998 21.0524 20.9998 20.5001V10.5001C20.9998 9.94779 20.552 9.50008 19.9998 9.50008H9.99976ZM6.99976 10.5001C6.99976 8.84322 8.3429 7.50008 9.99976 7.50008H19.9998C21.6566 7.50008 22.9998 8.84322 22.9998 10.5001V20.5001C22.9998 22.1569 21.6566 23.5001 19.9998 23.5001H9.99976C8.3429 23.5001 6.99976 22.1569 6.99976 20.5001V10.5001Z" fill="#1B1B1B"/>
      <path id="Vector (Stroke)_2" fill-rule="evenodd" clip-rule="evenodd" d="M3.99976 3.50008C3.45204 3.50008 2.99976 3.95236 2.99976 4.50008V14.5001C2.99976 15.0478 3.45204 15.5001 3.99976 15.5001C4.55204 15.5001 4.99976 15.9478 4.99976 16.5001C4.99976 17.0524 4.55204 17.5001 3.99976 17.5001C2.34747 17.5001 0.999756 16.1524 0.999756 14.5001V4.50008C0.999756 2.84779 2.34747 1.50008 3.99976 1.50008H13.9998C15.652 1.50008 16.9998 2.84779 16.9998 4.50008C16.9998 5.05236 16.552 5.50008 15.9998 5.50008C15.4475 5.50008 14.9998 5.05236 14.9998 4.50008C14.9998 3.95236 14.5475 3.50008 13.9998 3.50008H3.99976Z" fill="#1B1B1B"/>
    </g>
  </svg>
));
