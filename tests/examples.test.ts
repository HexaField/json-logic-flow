// Import jsonLogic with custom operations
import jsonLogic from "./setup";
import { examples } from "../example/src/examples";

// Ignore TypeScript errors for testing purposes
// @ts-ignore
const applyJsonLogic = (logic: any, data: any) => jsonLogic.apply(logic, data);

describe("JSON Logic Examples", () => {
  // Test the simple comparison example
  test("Simple Comparison: checks if user is at least 18 years old", () => {
    const example = examples.find((ex) => ex.id === "simple-comparison");
    expect(example).toBeDefined();

    if (example) {
      // Test with a user who is 25 (above 18)
      const result = applyJsonLogic(example.jsonLogic, example.testData);
      expect(result).toBe(true);

      // Test with a user who is 16 (below 18)
      const testData = {
        ...example.testData,
        user: { ...example.testData.user, age: 16 },
      };
      const result2 = applyJsonLogic(example.jsonLogic, testData);
      expect(result2).toBe(false);
    }
  });

  // Test the logical AND example
  test("Logical AND: checks if user is both an adult and has admin role", () => {
    const example = examples.find((ex) => ex.id === "logical-and");
    expect(example).toBeDefined();

    if (example) {
      // Test with a user who is 30 and has admin role
      const result = applyJsonLogic(example.jsonLogic, example.testData);
      expect(result).toBe(true);

      // Test with a user who is 30 but doesn't have admin role
      const testData1 = {
        ...example.testData,
        user: { ...example.testData.user, roles: ["user"] },
      };
      const result1 = applyJsonLogic(example.jsonLogic, testData1);
      expect(result1).toBe(false);

      // Test with a user who is 16 and has admin role
      const testData2 = {
        ...example.testData,
        user: { ...example.testData.user, age: 16 },
      };
      const result2 = applyJsonLogic(example.jsonLogic, testData2);
      expect(result2).toBe(false);
    }
  });

  // Test the conditional example
  test("Conditional Logic: applies different discount based on purchase amount", () => {
    const example = examples.find((ex) => ex.id === "conditional");
    expect(example).toBeDefined();

    if (example) {
      // Test with purchase amount of 75 (should get 10% discount)
      const result = applyJsonLogic(example.jsonLogic, example.testData);
      expect(result).toBe(0.1);

      // Test with purchase amount of 120 (should get 20% discount)
      const testData1 = {
        ...example.testData,
        purchase: { ...example.testData.purchase, amount: 120 },
      };
      const result1 = applyJsonLogic(example.jsonLogic, testData1);
      expect(result1).toBe(0.2);

      // Test with purchase amount of 30 (should get 5% discount)
      const testData2 = {
        ...example.testData,
        purchase: { ...example.testData.purchase, amount: 30 },
      };
      const result2 = applyJsonLogic(example.jsonLogic, testData2);
      expect(result2).toBe(0.05);
    }
  });

  // Test the array operations example
  test("Array Operations: calculates the sum of all items in a shopping cart", () => {
    const example = examples.find((ex) => ex.id === "array-operations");
    expect(example).toBeDefined();

    if (example) {
      // Test with the provided cart items (sum should be 90)
      const result = applyJsonLogic(example.jsonLogic, example.testData);
      expect(result).toBe(90);

      // Test with an empty cart (sum should be 0)
      const testData = {
        ...example.testData,
        cart: { ...example.testData.cart, items: [] },
      };
      const result2 = applyJsonLogic(example.jsonLogic, testData);
      expect(result2).toBe(0);
    }
  });

  // Test the string operations example
  test("String Operations: formats a greeting message based on time of day", () => {
    const example = examples.find((ex) => ex.id === "string-operations");
    expect(example).toBeDefined();

    if (example) {
      // Test with time of 14 (afternoon)
      const result = applyJsonLogic(example.jsonLogic, example.testData);
      expect(result).toBe("Good afternoon, Sarah!");

      // Test with time of 8 (morning)
      const testData1 = {
        ...example.testData,
        time: { ...example.testData.time, hour: 8 },
      };
      const result1 = applyJsonLogic(example.jsonLogic, testData1);
      expect(result1).toBe("Good morning, Sarah!");

      // Test with time of 20 (evening)
      const testData2 = {
        ...example.testData,
        time: { ...example.testData.time, hour: 20 },
      };
      const result2 = applyJsonLogic(example.jsonLogic, testData2);
      expect(result2).toBe("Good evening, Sarah!");
    }
  });

  // Test the complex form validation example
  test("Complex Form Validation: validates a form with multiple conditions", () => {
    const example = examples.find((ex) => ex.id === "complex-validation");
    expect(example).toBeDefined();

    if (example) {
      // Test with valid form data
      const result = applyJsonLogic(example.jsonLogic, example.testData);
      expect(result).toBe(true);

      // Test with invalid email (missing @)
      const testData1 = {
        ...example.testData,
        form: { ...example.testData.form, email: "userexample.com" },
      };
      const result1 = applyJsonLogic(example.jsonLogic, testData1);
      expect(result1).toBe(false);

      // Test with short password
      const testData2 = {
        ...example.testData,
        form: {
          ...example.testData.form,
          password: "short",
          confirmPassword: "short",
        },
      };
      const result2 = applyJsonLogic(example.jsonLogic, testData2);
      expect(result2).toBe(false);

      // Test with mismatched passwords
      const testData3 = {
        ...example.testData,
        form: { ...example.testData.form, confirmPassword: "differentpass" },
      };
      const result3 = applyJsonLogic(example.jsonLogic, testData3);
      expect(result3).toBe(false);

      // Test with terms not accepted
      const testData4 = {
        ...example.testData,
        form: { ...example.testData.form, acceptTerms: false },
      };
      const result4 = applyJsonLogic(example.jsonLogic, testData4);
      expect(result4).toBe(false);
    }
  });

  // Test the data transformation example
  test("Data Transformation: filters and transforms an array of products", () => {
    const example = examples.find((ex) => ex.id === "data-transformation");
    expect(example).toBeDefined();

    if (example) {
      // Test with the provided inventory data
      const result = applyJsonLogic(example.jsonLogic, example.testData);

      // The actual result is an array of arrays, where each inner array contains
      // the original product and the merged properties
      expect(result.length).toBe(3); // Three products match our filter criteria

      // Check that the filtered products are the ones we expect (in stock and < $100)
      const filteredProductIds = result.map((item: any[]) => item[0].id).sort();
      expect(filteredProductIds).toEqual(["P2", "P3", "P5"].sort());

      // Check that each result has the expected structure
      result.forEach((item: any[]) => {
        expect(item.length).toBe(2);
        expect(item[1]).toHaveProperty('discountedPrice');
        expect(item[1]).toHaveProperty('inStock', true);
      });

      // Test with empty inventory
      const testData1 = {
        ...example.testData,
        inventory: { products: [] }
      };
      const result1 = applyJsonLogic(example.jsonLogic, testData1);
      expect(result1).toEqual([]);

      // Test with all products out of stock
      const testData2 = {
        ...example.testData,
        inventory: {
          products: example.testData.inventory.products.map((product: any) => ({
            ...product,
            quantity: 0
          }))
        }
      };
      const result2 = applyJsonLogic(example.jsonLogic, testData2);
      expect(result2).toEqual([]);

      // Test with all products above $100
      const testData3 = {
        ...example.testData,
        inventory: {
          products: example.testData.inventory.products.map((product: any) => ({
            ...product,
            price: 150
          }))
        }
      };
      const result3 = applyJsonLogic(example.jsonLogic, testData3);
      expect(result3).toEqual([]);
    }
  });

  // Test the complex calculation example
  test("Complex Calculation: calculates weighted average score with bonus points", () => {
    const example = examples.find((ex) => ex.id === "complex-calculation");
    expect(example).toBeDefined();

    if (example) {
      // Test with the provided scores data
      const result = applyJsonLogic(example.jsonLogic, example.testData);

      // Expected result calculation:
      // Weighted average: (85*0.4 + 92*0.3 + 78*0.2 + 100*0.1) / 100 = 0.872
      // Perfect attendance bonus: 0.5
      // Extra credit (capped at 2): 1.5
      // Total: 0.872 + 0.5 + 1.5 = 2.872
      expect(result).toBeCloseTo(2.872, 3);

      // Test without perfect attendance and no extra credit
      const testData1 = {
        ...example.testData,
        scores: {
          ...example.testData.scores,
          perfectAttendance: false,
          extraCredit: 0
        }
      };
      const result1 = applyJsonLogic(example.jsonLogic, testData1);
      // Expected: just the weighted average (0.872)
      expect(result1).toBeCloseTo(0.872, 3);

      // Test with extra credit exceeding the cap
      const testData2 = {
        ...example.testData,
        scores: {
          ...example.testData.scores,
          extraCredit: 3
        }
      };
      const result2 = applyJsonLogic(example.jsonLogic, testData2);
      // Expected: weighted average (0.872) + attendance bonus (0.5) + capped extra credit (2) = 3.372
      expect(result2).toBeCloseTo(3.372, 3);

      // Test with different scores
      const testData3 = {
        ...example.testData,
        scores: {
          exam: 70,
          assignments: 80,
          participation: 90,
          attendance: 75,
          perfectAttendance: false,
          extraCredit: 1
        }
      };
      const result3 = applyJsonLogic(example.jsonLogic, testData3);
      // Expected: weighted average (70*0.4 + 80*0.3 + 90*0.2 + 75*0.1) / 100 = 0.775 + extra credit (1) = 1.775
      expect(result3).toBeCloseTo(1.775, 3);
    }
  });

  // Test the data aggregation example
  test("Data Aggregation: filters categories with sales over $100", () => {
    const example = examples.find((ex) => ex.id === "data-aggregation");
    expect(example).toBeDefined();

    if (example) {
      // Test with the provided categories data
      const result = applyJsonLogic(example.jsonLogic, example.testData);

      // Expected result: only categories with total > 100
      const expectedResult = [
        { name: "electronics", total: 1699, count: 2 },
        { name: "clothing", total: 205, count: 2 },
        { name: "books", total: 110, count: 2 }
      ];

      expect(result).toEqual(expectedResult);

      // Test with empty categories
      const testData1 = {
        ...example.testData,
        categories: []
      };
      const result1 = applyJsonLogic(example.jsonLogic, testData1);
      expect(result1).toEqual([]);

      // Test with all categories below threshold
      const testData2 = {
        ...example.testData,
        categories: [
          { name: "category1", total: 50, count: 1 },
          { name: "category2", total: 75, count: 2 }
        ]
      };
      const result2 = applyJsonLogic(example.jsonLogic, testData2);
      expect(result2).toEqual([]);

      // Test with mixed categories
      const testData3 = {
        ...example.testData,
        categories: [
          { name: "category1", total: 50, count: 1 },
          { name: "category2", total: 150, count: 2 }
        ]
      };
      const result3 = applyJsonLogic(example.jsonLogic, testData3);
      expect(result3).toEqual([
        { name: "category2", total: 150, count: 2 }
      ]);
    }
  });

  // Test the decision tree example
  test("Decision Tree: complex routing logic for customer support tickets", () => {
    const example = examples.find((ex) => ex.id === "decision-tree");
    expect(example).toBeDefined();

    if (example) {
      // Test with the provided ticket data (medium priority, technical, premium customer)
      const result = applyJsonLogic(example.jsonLogic, example.testData);
      expect(result).toBe("ROUTE_TO_TECHNICAL_PRIORITY");

      // Test high priority, billing category
      const testData1 = {
        ...example.testData,
        ticket: {
          ...example.testData.ticket,
          priority: "high",
          category: "billing"
        }
      };
      const result1 = applyJsonLogic(example.jsonLogic, testData1);
      expect(result1).toBe("ROUTE_TO_BILLING_URGENT");

      // Test high priority, technical category, security issue
      const testData2 = {
        ...example.testData,
        ticket: {
          ...example.testData.ticket,
          priority: "high",
          category: "technical",
          tags: {
            ...example.testData.ticket.tags,
            security: true
          }
        }
      };
      const result2 = applyJsonLogic(example.jsonLogic, testData2);
      expect(result2).toBe("ROUTE_TO_SECURITY_TEAM");

      // Test high priority, technical category, non-security issue
      const testData3 = {
        ...example.testData,
        ticket: {
          ...example.testData.ticket,
          priority: "high",
          category: "technical",
          tags: {
            ...example.testData.ticket.tags,
            security: false
          }
        }
      };
      const result3 = applyJsonLogic(example.jsonLogic, testData3);
      expect(result3).toBe("ROUTE_TO_TECHNICAL_URGENT");

      // Test high priority, other category
      const testData4 = {
        ...example.testData,
        ticket: {
          ...example.testData.ticket,
          priority: "high",
          category: "other"
        }
      };
      const result4 = applyJsonLogic(example.jsonLogic, testData4);
      expect(result4).toBe("ROUTE_TO_CUSTOMER_SERVICE_URGENT");

      // Test medium priority, non-premium customer
      const testData5 = {
        ...example.testData,
        ticket: {
          ...example.testData.ticket,
          priority: "medium",
          customer: {
            ...example.testData.ticket.customer,
            premium: false
          }
        }
      };
      const result5 = applyJsonLogic(example.jsonLogic, testData5);
      expect(result5).toBe("ROUTE_TO_technical_STANDARD");

      // Test medium priority, premium customer, billing category
      const testData6 = {
        ...example.testData,
        ticket: {
          ...example.testData.ticket,
          priority: "medium",
          category: "billing",
          customer: {
            ...example.testData.ticket.customer,
            premium: true
          }
        }
      };
      const result6 = applyJsonLogic(example.jsonLogic, testData6);
      expect(result6).toBe("ROUTE_TO_BILLING_PRIORITY");

      // Test low priority, feedback category
      const testData7 = {
        ...example.testData,
        ticket: {
          ...example.testData.ticket,
          priority: "low",
          category: "feedback"
        }
      };
      const result7 = applyJsonLogic(example.jsonLogic, testData7);
      expect(result7).toBe("ROUTE_TO_FEEDBACK_COLLECTION");

      // Test low priority, question category
      const testData8 = {
        ...example.testData,
        ticket: {
          ...example.testData.ticket,
          priority: "low",
          category: "question"
        }
      };
      const result8 = applyJsonLogic(example.jsonLogic, testData8);
      expect(result8).toBe("ROUTE_TO_KNOWLEDGE_BASE");

      // Test low priority, other category
      const testData9 = {
        ...example.testData,
        ticket: {
          ...example.testData.ticket,
          priority: "low",
          category: "other"
        }
      };
      const result9 = applyJsonLogic(example.jsonLogic, testData9);
      expect(result9).toBe("ROUTE_TO_GENERAL_QUEUE");
    }
  });
});
