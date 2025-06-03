import logger from '../lib/logger';
import Script from 'next/script';
import type { DonorboxSchemaType } from '../schemas/fields/component/donorbox';

export async function SanityDonorbox({ value }: { value: DonorboxSchemaType }) {
  const { showDonorbox, url, enablePaypalExpress } = value;

  if (!url) {
    logger.warn('SanityDonorbox: Missing src');
    return null;
  }

  if (!showDonorbox) {
    return null;
  }

  return (
    <>
      <Script
        src="https://donorbox.org/widget.js"
        // @ts-expect-error -- Custom required donorbox property
        paypalExpress={(enablePaypalExpress ?? false).toString()}
      />
      <iframe
        allow="payment"
        // @ts-expect-error -- Custom required donorbox property
        allowpaymentrequest="allowpaymentrequest"
        frameBorder="0"
        height="900px"
        name="donorbox"
        scrolling="no"
        seamless
        src={url}
        className="border-session-black mx-auto my-6 border md:min-w-[420px]"
        width="max-content"
      />
    </>
  );
}
