import type { GenericSchemaType, SchemaFields } from '@session/sanity-types';
import type { PortableTextBlock } from 'sanity';
import type {
  ImageFieldsSchemaType,
  ImageFieldsSchemaTypeWithoutAltText,
} from './fields/basic/image';
import type { SeoType } from './fields/basic/seo';

type CustomFieldTypeMap = {
  seoMetaFields: SeoType;
  image: ImageFieldsSchemaType | ImageFieldsSchemaTypeWithoutAltText;
  block: PortableTextBlock;
};

export type SchemaFieldsType<Fields extends SchemaFields<CustomFieldTypeMap>> = GenericSchemaType<
  CustomFieldTypeMap,
  Fields
>;
