const Node = require("./AST/node");
const { Program, Feature, Tag, Description, Story } = require("./AST/type");

module.exports = class Parser {
    // reg: (?<!\S( )*)

    static parse(content) {
        content = Parser.#replaceComments(content);
        const nodes = Parser.#traverse(content);
        const ast = new Node({
            type: Program,
            start: Parser.#getStartIndex(content),
            end: Parser.#getEndIndex(content),
            body: nodes,
        });

        return ast;
    }

    static #getStartIndex(content) {
        return content.search(/(?<=[\s]*)\S/);
    }

    static #getEndIndex(content) {
        return content.trimEnd().length;
    }

    static #traverse(content) {
        const nodes = [];
        const feature = Parser.#feature(content);
        if (feature) {
            const reducedContent = content.replace(
                content.substring(feature.start, feature.end),
                ""
            );
            const tags = Parser.#tags(reducedContent);
            if (tags) nodes.push(...tags);

            const featureContext = content.substring(
                feature.start,
                feature.end
            );
            // const rules = Parser.#rules(featureContext);
            // if (rules) feature.body.push(...rules);

            nodes.push(feature);
        }
        return nodes;
    }

    static #feature(content) {
        const match = /Feature:[\s\S]*/g.exec(content);
        if (!match) return null;

        const node = new Node({
            type: Feature,
            start: match.index,
            end: match.index + match[0].length,
            body: [],
        });

        const title = Parser.#title(match[0]);
        if (title) node.body.push(title);

        const story = Parser.#story(match[0]);
        if (story) node.body.push(story);

        return node;
    }

    static #title(content) {
        const regex =
            /(?<=(Feature|Rule|Background|Scenario|Example|Scenario Outline|Scenario Template):).*/;
        const match = regex.exec(content);
        if (match)
            return new Node({
                type: Description,
                start: match.index,
                end: match.index + match[0].length,
                value: match[0],
            });
        return null;
    }

    static #story(content) {
        const regex =
            /As[\s\S]*(?=([\r\n]( )*((Rule|Background|Scenario|Example|Scenario Outline|Scenario Template):|#|@|)))/;
        const match = regex.exec(content);
        if (match)
            return new Node({
                type: Story,
                start: match.index,
                end: match.index + match[0].length,
            });
        return null;
    }

    static #tags(content) {
        const regex = /@[^\s]*/g;
        let match = null;
        const nodes = [];
        while ((match = regex.exec(content)) !== null) {
            nodes.push(
                new Node({
                    type: Tag,
                    start: match.index,
                    end: match.index + match[0].length,
                    name: match[0],
                })
            );
        }

        if (!nodes.length) return null;

        return nodes;
    }

    static #replaceComments(content) {
        const regex = /#.*/g;
        let match = null;
        while ((match = regex.exec(content)) !== null) {
            content = content.replace(match[0], " ".repeat(match[0].length));
        }
        return content;
    }
};
