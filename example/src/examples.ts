import { jsonLogicToGraph } from '../../src/utils/jsonLogicConverter';

/**
 * This file contains example JSON Logic rules.
 *
 * The state transformation examples (budget and subscription) represent the following JavaScript code:
 *
 * ```javascript
 * (action, state) => {
 *   if (!state[action.entityId]) return state;
 *
 *   switch (action.actionType) {
 *     case 'extendSubscription':
 *       if (action.value) {
 *         state[action.entityId].subscription = {
 *           active: true,
 *           expiryDate: action.currentTime + action.value
 *         }
 *       }
 *       break;
 *
 *     case 'adjustBudget':
 *       if (typeof action.value === 'number') {
 *         state[action.entityId].budget = Math.min(
 *           state[action.entityId].budget + action.value,
 *           state[action.entityId].maxBudget
 *         )
 *       }
 *       break;
 *   }
 *
 *   return state;
 * }
 * ```
 */

export interface Example {
  id: string;
  name: string;
  description: string;
  jsonLogic: any;
  testData: any;
}

export const examples: Example[] = [
  {
    id: 'state-transformation-budget',
    name: 'State Transformation (Budget)',
    description: 'Transform state by adjusting a department budget with a maximum cap',
    jsonLogic: {
      "if": [
        // if entity missing, no-op
        { "!": [{ "var": ["state", "action.entityId"] }] },
        { "var": "state" },
        // else choose by actionType
        {
          "if": [
            { "==": [ { "var": ["action","actionType"] }, "extendSubscription" ] },
            {
              "if": [
                { "var": ["action","value"] },
                // set subscription object
                {
                  "merge": [
                    { "var": "state" },
                    {
                      "{action.entityId}": {
                        "subscription": {
                          "active": true,
                          "expiryDate": { "+": [ { "var": ["action","currentTime"] }, { "var": ["action","value"] } ] }
                        }
                      }
                    }
                  ]
                },
                { "var": "state" }
              ]
            },
            // else if adjustBudget
            {
              "if": [
                { "and": [
                    { "==": [ { "var": ["action","actionType"] }, "adjustBudget" ] },
                    { "==": [ { "typeof": [ { "var": ["action","value"] } ] }, "number" ] }
                  ]
                },
                // adjust budget capped at maxBudget
                {
                  "merge": [
                    { "var": "state" },
                    {
                      "{action.entityId}": {
                        "budget": {
                          "min": [
                            { "var": ["state", "{action.entityId}", "maxBudget"] },
                            { "+": [
                                { "var": ["state", "{action.entityId}", "budget"] },
                                { "var": ["action","value"] }
                            ] }
                          ]
                        }
                      }
                    }
                  ]
                },
                { "var": "state" }
              ]
            }
          ]
        }
      ]
    },
    testData: {
      action: {
        entityId: "dept1",
        actionType: "adjustBudget",
        value: 5000,
        currentTime: 1620000000000
      },
      state: {
        dept1: {
          budget: 10000,
          maxBudget: 20000,
          subscription: {
            active: false,
            expiryDate: 0
          }
        },
        dept2: {
          budget: 15000,
          maxBudget: 25000,
          subscription: {
            active: false,
            expiryDate: 0
          }
        }
      }
    }
  },
  {
    id: 'state-transformation-subscription',
    name: 'State Transformation (Subscription)',
    description: 'Transform state by extending a user subscription expiration date',
    jsonLogic: {
      "if": [
        // if entity missing, no-op
        { "!": [{ "var": ["state", "action.entityId"] }] },
        { "var": "state" },
        // else choose by actionType
        {
          "if": [
            { "==": [ { "var": ["action","actionType"] }, "extendSubscription" ] },
            {
              "if": [
                { "var": ["action","value"] },
                // set subscription object
                {
                  "merge": [
                    { "var": "state" },
                    {
                      "{action.entityId}": {
                        "subscription": {
                          "active": true,
                          "expiryDate": { "+": [ { "var": ["action","currentTime"] }, { "var": ["action","value"] } ] }
                        }
                      }
                    }
                  ]
                },
                { "var": "state" }
              ]
            },
            // else if adjustBudget
            {
              "if": [
                { "and": [
                    { "==": [ { "var": ["action","actionType"] }, "adjustBudget" ] },
                    { "==": [ { "typeof": [ { "var": ["action","value"] } ] }, "number" ] }
                  ]
                },
                // adjust budget capped at maxBudget
                {
                  "merge": [
                    { "var": "state" },
                    {
                      "{action.entityId}": {
                        "budget": {
                          "min": [
                            { "var": ["state", "{action.entityId}", "maxBudget"] },
                            { "+": [
                                { "var": ["state", "{action.entityId}", "budget"] },
                                { "var": ["action","value"] }
                            ] }
                          ]
                        }
                      }
                    }
                  ]
                },
                { "var": "state" }
              ]
            }
          ]
        }
      ]
    },
    testData: {
      action: {
        entityId: "user1",
        actionType: "extendSubscription",
        value: 2592000000, // 30 days in milliseconds
        currentTime: 1620000000000
      },
      state: {
        user1: {
          budget: 0,
          maxBudget: 0,
          subscription: {
            active: false,
            expiryDate: 0
          }
        },
        user2: {
          budget: 0,
          maxBudget: 0,
          subscription: {
            active: true,
            expiryDate: 1622000000000
          }
        }
      }
    }
  },
  {
    id: 'simple-comparison',
    name: 'Simple Comparison',
    description: 'Check if a user is at least 18 years old',
    jsonLogic: {
      ">=": [
        { "var": "user.age" },
        18
      ]
    },
    testData: {
      user: {
        name: "John",
        age: 25
      }
    }
  },
  {
    id: 'logical-and',
    name: 'Logical AND',
    description: 'Check if a user is both an adult and has admin role',
    jsonLogic: {
      "and": [
        {
          ">=": [
            { "var": "user.age" },
            18
          ]
        },
        {
          "in": [
            "admin",
            { "var": "user.roles" }
          ]
        }
      ]
    },
    testData: {
      user: {
        name: "Alice",
        age: 30,
        roles: ["user", "admin"]
      }
    }
  },
  {
    id: 'conditional',
    name: 'Conditional Logic',
    description: 'Apply different discount based on purchase amount',
    jsonLogic: {
      "if": [
        {
          ">=": [
            { "var": "purchase.amount" },
            100
          ]
        },
        0.2, // 20% discount for purchases >= $100
        {
          "if": [
            {
              ">=": [
                { "var": "purchase.amount" },
                50
              ]
            },
            0.1, // 10% discount for purchases >= $50
            0.05 // 5% discount for all other purchases
          ]
        }
      ]
    },
    testData: {
      purchase: {
        id: "P12345",
        amount: 75,
        items: 3
      }
    }
  },
  {
    id: 'array-operations',
    name: 'Array Operations',
    description: 'Calculate the sum of all items in a shopping cart',
    jsonLogic: {
      "reduce": [
        { "var": "cart.items" },
        {
          "+": [
            { "var": "accumulator" },
            { "var": "current.price" }
          ]
        },
        0
      ]
    },
    testData: {
      cart: {
        id: "C789",
        items: [
          { id: "I1", name: "Book", price: 15 },
          { id: "I2", name: "Shirt", price: 25 },
          { id: "I3", name: "Headphones", price: 50 }
        ]
      }
    }
  },
  {
    id: 'string-operations',
    name: 'String Operations',
    description: 'Format a greeting message based on time of day',
    jsonLogic: {
      "cat": [
        {
          "if": [
            {
              "<": [
                { "var": "time.hour" },
                12
              ]
            },
            "Good morning",
            {
              "if": [
                {
                  "<": [
                    { "var": "time.hour" },
                    18
                  ]
                },
                "Good afternoon",
                "Good evening"
              ]
            }
          ]
        },
        ", ",
        { "var": "user.name" },
        "!"
      ]
    },
    testData: {
      user: {
        name: "Sarah"
      },
      time: {
        hour: 14,
        minute: 30
      }
    }
  },
  {
    id: 'complex-validation',
    name: 'Complex Form Validation',
    description: 'Validate a form with multiple conditions',
    jsonLogic: {
      "and": [
        // Email must contain @
        {
          "in": [
            "@",
            { "var": "form.email" }
          ]
        },
        // Password must be at least 8 characters
        {
          ">=": [
            {
              "length": { "var": "form.password" }
            },
            8
          ]
        },
        // Passwords must match
        {
          "===": [
            { "var": "form.password" },
            { "var": "form.confirmPassword" }
          ]
        },
        // Terms must be accepted
        { "var": "form.acceptTerms" }
      ]
    },
    testData: {
      form: {
        email: "user@example.com",
        password: "securepass123",
        confirmPassword: "securepass123",
        acceptTerms: true
      }
    }
  }
];

// Convert each example to ReactFlow nodes and edges
export const exampleFlows = examples.map(example => ({
  ...example,
  flow: jsonLogicToGraph(example.jsonLogic)
}));
