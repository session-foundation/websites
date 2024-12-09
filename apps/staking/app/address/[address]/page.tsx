import { AddressInfo } from '@/app/address/[address]/addressInfo';

export default async function Page(props: { params: Promise<{ address: string }> }) {
  const params = await props.params;
  return <AddressInfo address={params.address} />;
}
