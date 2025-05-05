import jsonLogic from 'json-logic-js';

// Add custom operations for testing
jsonLogic.add_operation('length', function(val) {
  return val ? val.length : 0;
});

export default jsonLogic;
