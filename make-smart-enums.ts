import {
  ASTPath,
  ExportNamedDeclaration,
  JSCodeshift,
  ObjectTypeProperty,
  TSLiteralType,
  TSPropertySignature,
  TSTypeAliasDeclaration,
  TSTypeLiteral,
  TSTypeReference,
} from 'jscodeshift/src/core';

import { FlowKind, FlowTypeKind, TSTypeKind } from 'ast-types/gen/kinds';
import { namedTypes } from 'ast-types/gen/namedTypes';
import _ from 'lodash';
import {
  getTypeDeclaraiontName,
  isIdentifier,
  isTsPropertySignature,
  isTsTypeLiteral,
  isTSTypeReference,
  isTSUnionType,
} from './helpers';

const convertTsTypeIntoFlowType = (t: TSTypeKind, j: JSCodeshift): FlowKind => {
  if (t.type !== 'TSTypeLiteral') {
    throw new Error(`Unsupported ts type ${t.type}`);
  }

  return j.objectTypeAnnotation(
    t.members.map(
      (
        tsMember:
          | namedTypes.TSCallSignatureDeclaration
          | namedTypes.TSConstructSignatureDeclaration
          | namedTypes.TSIndexSignature
          | namedTypes.TSMethodSignature
          | namedTypes.TSPropertySignature
      ): ObjectTypeProperty => {
        if (tsMember.type !== 'TSPropertySignature') {
          throw new Error(`Unsupported object member type ${tsMember.type}`);
        }
        if (tsMember.key.type !== 'Identifier') {
          throw new Error(
            `Unsupported object member key type ${tsMember.key.type}`
          );
        }

        const memberValue = tsMember.typeAnnotation.typeAnnotation;

        let newMemberValue: FlowTypeKind;
        if (memberValue.type === 'TSTypeReference') {
          if (memberValue.typeName.type === 'Identifier') {
            newMemberValue = j.typeParameter(memberValue.typeName.name);
          }
        } else if (memberValue.type === 'TSNumberKeyword') {
          newMemberValue = j.numberTypeAnnotation();
        } else if (memberValue.type === 'TSStringKeyword') {
          newMemberValue = j.stringTypeAnnotation();
        } else if (memberValue.type === 'TSLiteralType') {
          if (memberValue.literal.type === 'StringLiteral') {
            newMemberValue = j.stringLiteralTypeAnnotation(
              memberValue.literal.value,
              memberValue.literal.value
            );
          }
        }

        if (!newMemberValue) {
          throw new Error(`Unsupported member value type: ${memberValue.type}`);
        }

        return j.objectTypeProperty(
          tsMember.key,
          newMemberValue,
          tsMember.optional
        );
      }
    )
  );
};

module.exports = function (file, api) {
  const j = api.jscodeshift;
  const nameToAliases = {};
  return j(file.source)
    .find(j.ExportNamedDeclaration)
    .replaceWith((ex: ASTPath<ExportNamedDeclaration>) => {
      if (ex.value.declaration.type !== 'TSTypeAliasDeclaration') {
        return ex.value;
      }
      const p = ex.value.declaration;
      const mainUnionName = getTypeDeclaraiontName(p);
      if (!mainUnionName) {
        // not a union, not interesting
        return ex.value;
      }

      const union = p.typeAnnotation;
      if (!isTSUnionType(union)) {
        return ex.value;
      }
      const typesWithNames = union.types
        .map((t) => {
          if (isTSTypeReference(t) && isIdentifier(t.typeName)) {
            return [t, t.typeName.name];
          }
          if (isTsTypeLiteral(t)) {
            let tagName = null;
            for (const member of t.members) {
              if (isTsPropertySignature(member)) {
                if (isIdentifier(member.key)) {
                  if (member.key.name === 'tag') {
                    const typeAnnotation = member.typeAnnotation;
                    // @ts-ignore
                    tagName = typeAnnotation.typeAnnotation.literal.value;
                  }
                }
              }
            }
            return [t, tagName];
          }
          return null;
        })
        .filter((t) => !!t) as [TSTypeKind, string][];
      const aliases = typesWithNames.map((typeAndName) => {
        return [`${mainUnionName}${typeAndName[1]}`, typeAndName[1]];
      });
      const typesByName = _.mapValues(
        _.keyBy(typesWithNames, (p) => p[1]),
        (v) => v[0]
      );
      nameToAliases[mainUnionName] = aliases.map((a) => a[0]);
      const insertedDeclarations = aliases
        .map(([fullMemberName, shortMemberName]) => {
          const movedType = typesByName[shortMemberName];
          if (movedType && movedType.type === 'TSTypeReference') {
            return j.exportNamedDeclaration(
              j.typeAlias(
                j.identifier(fullMemberName),
                null,
                j.typeParameter(shortMemberName)
              )
            );
          }
          if (movedType && movedType.type === 'TSTypeLiteral') {
            const convertedObjectType = convertTsTypeIntoFlowType(movedType, j);
            return j.exportNamedDeclaration(
              j.typeAlias(
                j.identifier(fullMemberName),
                null,
                convertedObjectType
              )
            );
          }
          return null;
        })
        .filter((d) => !!d);
      const unionName = getTypeDeclaraiontName(p);
      if (!unionName) {
        // not a union, not interesting
        return ex.value;
      }

      const aliases2 = nameToAliases[unionName];
      if (!aliases2) {
        return ex.value;
      }

      return [
        ...insertedDeclarations,

        j.exportNamedDeclaration(
          j.typeAlias(
            j.identifier(unionName),
            null,
            j.unionTypeAnnotation(aliases2.map((a) => j.typeParameter(a)))
          )
        ),
      ];
    })
    .toSource();
};
module.exports.parser = 'ts';
