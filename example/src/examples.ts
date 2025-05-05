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
  },
  {
    id: 'data-transformation',
    name: 'Data Transformation',
    description: 'Filter and transform an array of products',
    jsonLogic: {
      "map": [
        {
          "filter": [
            { "var": "inventory.products" },
            {
              "and": [
                { ">": [{ "var": "quantity" }, 0] },
                { "<": [{ "var": "price" }, 100] }
              ]
            }
          ]
        },
        {
          "merge": [
            { "var": "" },
            {
              "discountedPrice": {
                "*": [
                  { "var": "price" },
                  { "-": [1, { "var": "discount" }] }
                ]
              },
              "inStock": true
            }
          ]
        }
      ]
    },
    testData: {
      inventory: {
        products: [
          { id: "P1", name: "Laptop", price: 899, quantity: 5, discount: 0.1 },
          { id: "P2", name: "Mouse", price: 25, quantity: 10, discount: 0.05 },
          { id: "P3", name: "Keyboard", price: 60, quantity: 3, discount: 0.1 },
          { id: "P4", name: "Monitor", price: 250, quantity: 0, discount: 0.15 },
          { id: "P5", name: "USB Drive", price: 15, quantity: 25, discount: 0 }
        ]
      }
    }
  },
  {
    id: 'complex-calculation',
    name: 'Complex Calculation',
    description: 'Calculate weighted average score with bonus points',
    jsonLogic: {
      "+": [
        {
          "/": [
            {
              "+": [
                { "*": [{ "var": "scores.exam" }, 0.4] },
                { "*": [{ "var": "scores.assignments" }, 0.3] },
                { "*": [{ "var": "scores.participation" }, 0.2] },
                { "*": [{ "var": "scores.attendance" }, 0.1] }
              ]
            },
            100
          ]
        },
        {
          "if": [
            { "===": [{ "var": "scores.perfectAttendance" }, true] },
            0.5,
            0
          ]
        },
        {
          "if": [
            { ">": [{ "var": "scores.extraCredit" }, 0] },
            {
              "min": [
                { "var": "scores.extraCredit" },
                2
              ]
            },
            0
          ]
        }
      ]
    },
    testData: {
      scores: {
        exam: 85,
        assignments: 92,
        participation: 78,
        attendance: 100,
        perfectAttendance: true,
        extraCredit: 1.5
      }
    }
  },
  {
    id: 'data-aggregation',
    name: 'Data Aggregation',
    description: 'Calculate total sales by category',
    jsonLogic: {
      "filter": [
        { "var": "categories" },
        { ">": [{ "var": "total" }, 100] }
      ]
    },
    testData: {
      categories: [
        { name: "electronics", total: 1699, count: 2 },
        { name: "clothing", total: 205, count: 2 },
        { name: "books", total: 110, count: 2 },
        { name: "office", total: 65, count: 1 }
      ]
    }
  },
  {
    id: 'decision-tree',
    name: 'Decision Tree',
    description: 'Complex routing logic for customer support tickets',
    jsonLogic: {
      "if": [
        // Check if it's a high priority ticket
        { "===": [{ "var": "ticket.priority" }, "high"] },
        {
          "if": [
            // For high priority, check if it's a billing issue
            { "===": [{ "var": "ticket.category" }, "billing"] },
            "ROUTE_TO_BILLING_URGENT",
            {
              "if": [
                // For high priority, check if it's a technical issue
                { "===": [{ "var": "ticket.category" }, "technical"] },
                {
                  "if": [
                    // For high priority technical, check if it's a security issue
                    { "var": "ticket.tags.security" },
                    "ROUTE_TO_SECURITY_TEAM",
                    "ROUTE_TO_TECHNICAL_URGENT"
                  ]
                },
                // For high priority, other categories
                "ROUTE_TO_CUSTOMER_SERVICE_URGENT"
              ]
            }
          ]
        },
        {
          "if": [
            // Check if it's a medium priority ticket
            { "===": [{ "var": "ticket.priority" }, "medium"] },
            {
              "if": [
                // For medium priority, check if customer is premium
                { "var": "ticket.customer.premium" },
                {
                  "if": [
                    // For medium priority premium, check category
                    { "===": [{ "var": "ticket.category" }, "billing"] },
                    "ROUTE_TO_BILLING_PRIORITY",
                    {
                      "if": [
                        { "===": [{ "var": "ticket.category" }, "technical"] },
                        "ROUTE_TO_TECHNICAL_PRIORITY",
                        "ROUTE_TO_CUSTOMER_SERVICE_PRIORITY"
                      ]
                    }
                  ]
                },
                // For medium priority non-premium
                {
                  "cat": [
                    "ROUTE_TO_",
                    { "var": "ticket.category" },
                    "_STANDARD"
                  ]
                }
              ]
            },
            // For low priority tickets
            {
              "if": [
                // For low priority, check if it's a feedback
                { "===": [{ "var": "ticket.category" }, "feedback"] },
                "ROUTE_TO_FEEDBACK_COLLECTION",
                // For low priority, check if it's a question
                {
                  "if": [
                    { "===": [{ "var": "ticket.category" }, "question"] },
                    "ROUTE_TO_KNOWLEDGE_BASE",
                    // Default routing for low priority
                    "ROUTE_TO_GENERAL_QUEUE"
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    testData: {
      ticket: {
        id: "T12345",
        priority: "medium",
        category: "technical",
        subject: "Cannot access account",
        description: "I'm getting an error when trying to log in",
        customer: {
          id: "C789",
          name: "Jane Smith",
          premium: true,
          accountAge: 3.5 // years
        },
        tags: {
          security: false,
          mobile: true,
          login: true
        }
      }
    }
  }
];

// Convert each example to ReactFlow nodes and edges
export const exampleFlows = examples.map(example => ({
  ...example,
  flow: jsonLogicToGraph(example.jsonLogic)
}));
