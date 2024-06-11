const generator = require("../../../helpers/problemGenerator");
const NoTrailingWhitespace = require("../../../../lib/rules/no_trailing_whitespace");

function generateProblem(location) {
    return generator(
        NoTrailingWhitespace,
        location,
        NoTrailingWhitespace.meta.message,
        {
            applyFix: jest.fn(),
        }
    );
}

function getValidTestData() {
    return [
        [
            "should show no problems",
            `Feature: a feature file

  Background: a background
    Given a step

  Scenario: a scenario
    When a step
`,
            [],
        ],
        [
            "white spaces in docstring should be ignored",
            `Feature: a feature file
  Scenario: a scenario
    When a step
      """
      lorem
        start with spaces
      some with spaces at the end      


        end with spaces
        
      """
`,
            [],
        ],
    ];
}
function getInvalidTestData() {
    return [
        [
            "should show problems",
            `Feature: a feature file 

  Background: a background  
    Given a step    
    `,
            [
                generateProblem({ line: 1, column: 24 }),
                generateProblem({ line: 3, column: 27 }),
                generateProblem({ line: 4, column: 17 }),
                generateProblem({ line: 5, column: 1 }),
            ],
        ],
    ];
}

function getInvalidTestDataWithFix() {
    return [
        [
            "trailing whitespace in: keyword",
            "Feature: a feature file   ",
            generateProblem({ line: 1 }),
            "Feature: a feature file",
        ],
        [
            "trailing whitespace in: description",
            `Feature: a feature file
As a user            
`,
            generateProblem({ line: 2 }),
            `Feature: a feature file
As a user
`,
        ],
        [
            "trailing whitespace in: comment",
            `# comment line      
Feature: a feature file
`,
            generateProblem({ line: 1 }),
            `# comment line
Feature: a feature file
`,
        ],
        [
            "trailing whitespace in: new line",
            `Feature: a feature file
      
  Background: a background`,
            generateProblem({ line: 2 }),
            `Feature: a feature file

  Background: a background`,
        ],
    ];
}

module.exports = {
    generateProblem,
    getValidTestData,
    getInvalidTestData,
    getInvalidTestDataWithFix,
};
