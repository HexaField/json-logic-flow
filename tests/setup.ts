import jsonLogic from 'json-logic-js';

// Add custom operations for testing
jsonLogic.add_operation('length', function(val) {
  return val ? val.length : 0;
});

// Add typeof operation
jsonLogic.add_operation('typeof', function(val) {
  return typeof val;
});

// Add merge operation for objects
jsonLogic.add_operation('merge', function(obj1, obj2) {
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    return obj1;
  }
  return { ...obj1, ...obj2 };
});

// Add min operation
jsonLogic.add_operation('min', function(a, b) {
  return Math.min(a, b);
});

export default jsonLogic;
