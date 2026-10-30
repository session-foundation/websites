import { SANITY_SCHEMA_URL } from '@/lib/constants';
import { client } from '@/lib/sanity/sanity.client';
import { SanityAnchor } from '@session/sanity-cms/components/SanityAnchor';
import { SanityButton } from '@session/sanity-cms/components/SanityButton';
import { SanityCryptoAddressDisplay } from '@session/sanity-cms/components/SanityCryptoAddressDisplay';
import { SanityDonorbox } from '@session/sanity-cms/components/SanityDonorbox';
import { SanityImage } from '@session/sanity-cms/components/SanityImage';
import {
  type SanityPortableTextProps,
  basicComponents,
} from '@session/sanity-cms/components/SanityPortableText';
import { SanityTiles } from '@session/sanity-cms/components/SanityTiles';
import { getCryptoAddressById } from '@session/sanity-cms/queries/getCryptoAddress';
import { getLocale, getTranslations } from 'next-intl/server';
import { getLangDir } from 'rtl-detect';

const { marks, block } = basicComponents;
export const components = {
  marks,
  block,
  types: {
    image: async ({ value, isInline }) => {
      const imageDictionary = await getTranslations('image');
      return (
        <SanityImage
          value={value}
          isInline={isInline}
          client={client}
          figureNumberTextTemplate={imageDictionary('figureLabelTemplate')}
          className="my-4 md:my-6"
        />
      );
    },
    button: (props) => (
      <SanityButton {...props} client={client} postBaseUrl={SANITY_SCHEMA_URL.POST} />
    ),
    tiles: async (props) => {
      const tileDictionary = await getTranslations('tile');
      const locale = await getLocale();
      const direction = getLangDir(locale);

      return (
        <SanityTiles
          {...props}
          client={client}
          scrollText={tileDictionary('scrollOrTap')}
          isRTLLocale={direction === 'rtl'}
        />
      );
    },
    cryptoAddressDisplay: async (props) => {
      const refId = props.value.cryptoAddress._ref;

      props.value.cryptoAddress = await getCryptoAddressById({ client, id: refId });

      return <SanityCryptoAddressDisplay {...props} variant="light" />;
    },
    donorbox: (props) => <SanityDonorbox {...props} />,
    anchor: (props) => <SanityAnchor {...props} />,
  },
} satisfies SanityPortableTextProps['components'];
