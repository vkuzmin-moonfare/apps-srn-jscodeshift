import {
  TSLiteralType,
  TSPropertySignature,
  TSTypeAliasDeclaration,
  TSTypeLiteral,
  TSTypeReference,
  TSUnionType,
} from 'jscodeshift/src/core';
import { IdentifierKind } from 'ast-types/gen/kinds';

export const isTSUnionType = (t: any): t is TSUnionType => {
  return t.type === 'TSUnionType';
};
export const isTSTypeReference = (t: any): t is TSTypeReference => {
  return t.type === 'TSTypeReference';
};
export const isIdentifier = (t: any): t is IdentifierKind => {
  return t.type === 'Identifier';
};
export const isTsTypeLiteral = (t: any): t is TSTypeLiteral => {
  return t.type === 'TSTypeLiteral';
};
export const isTsTypeReference = (t: any): t is TSTypeReference => {
  return t.type === 'TSTypeReference';
};
const isTsLiteralType = (t: any): t is TSLiteralType => {
  return t.type === 'TSLiteralType';
};
export const isTsTypeAliasDeclaration = (
  t: any
): t is TSTypeAliasDeclaration => {
  return t.type === 'TSTypeAliasDeclaration';
};
export const isTsPropertySignature = (t: any): t is TSPropertySignature => {
  return t.type === 'TSPropertySignature';
};
export const getTypeDeclaraiontName = (
  p: TSTypeAliasDeclaration
): string | undefined => {
  const typeName = p.id;
  if (!isIdentifier(typeName)) {
    return;
  }
  return typeName.name;
};
