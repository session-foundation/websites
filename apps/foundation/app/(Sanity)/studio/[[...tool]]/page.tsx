import Studio from '@/app/(Sanity)/studio/[[...tool]]/Studio';
import { SanityStudioSSRPage } from '@session/sanity-cms/components/SanityStudioSSRPage';
import { Loading } from '@session/ui/components/loading';

export default function StudioPage() {
  return <SanityStudioSSRPage sanityStudio={<Studio />} suspenseFallback={<Loading />} />;
}
