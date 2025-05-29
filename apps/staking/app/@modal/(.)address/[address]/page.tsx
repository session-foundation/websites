import { AddressModalDescription } from '@/app/@modal/(.)address/[address]/AddressModalDescription';
import { AddressModalTitle } from '@/app/@modal/(.)address/[address]/AddressModalTitle';
import { AddressInfo } from '@/app/address/[address]/addressInfo';
import Modal from '@session/ui/ui/modal';

export default async function Page(props: { params: Promise<{ address: string }> }) {
  const params = await props.params;
  return <AddressModal address={params.address} />;
}

export function AddressModal({ address }: { address: string }) {
  return (
    <Modal
      navigation
      size="lg"
      dialogTitle={<AddressModalTitle address={address} />}
      dialogDescription={<AddressModalDescription address={address} />}
      className="max-h-[75dvh] overflow-y-auto"
    >
      <AddressInfo address={address} />
    </Modal>
  );
}
