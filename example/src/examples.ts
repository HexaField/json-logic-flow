import { jsonLogicToGraph } from '../../src/utils/jsonLogicConverter';

export interface Example {
  id: string;
  name: string;
  description: string;
  jsonLogic: any;
  testData: any;
}

export const examples: Example[] = [
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
