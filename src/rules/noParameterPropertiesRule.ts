/**
 * @license
 * Copyright 2013 Palantir Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as ts from "typescript";

import * as Lint from "../index";

export class Rule extends Lint.Rules.AbstractRule {
    /* tslint:disable:object-literal-sort-keys */
    public static metadata: Lint.IRuleMetadata = {
        ruleName: "no-parameter-properties",
        description: "Disallows parameter properties in class constructors.",
        rationale: Lint.Utils.dedent`
            Parameter properties can be confusing to those new to TS as they are less explicit
            than other ways of declaring and initializing class members.`,
        optionsDescription: "Not configurable.",
        options: null,
        optionExamples: ["true"],
        type: "style",
        typescriptOnly: true,
    };
    /* tslint:enable:object-literal-sort-keys */

    public static FAILURE_STRING_FACTORY = (ident: string) => {
        return `Property '${ident}' cannot be declared in the constructor`;
    }

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new NoParameterPropertiesWalker(sourceFile, this.getOptions()));
    }
}

export class NoParameterPropertiesWalker extends Lint.RuleWalker {
    public visitConstructorDeclaration(node: ts.ConstructorDeclaration) {
        const parameters = node.parameters;
        for (let parameter of parameters) {
            if (parameter.modifiers != null && parameter.modifiers.length > 0) {
                const errorMessage = Rule.FAILURE_STRING_FACTORY((parameter.name as ts.Identifier).text);
                const lastModifier = parameter.modifiers[parameter.modifiers.length - 1];
                this.addFailureFromStartToEnd(parameter.getStart(), lastModifier.getEnd(), errorMessage);
            }
        }
        super.visitConstructorDeclaration(node);
    }
}
