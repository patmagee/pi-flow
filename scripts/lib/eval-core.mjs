const assertionTypes = new Set([
  "includesAll",
  "includesAny",
  "excludesAll",
  "matches",
  "notMatches",
]);

function requireString(value, path) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`${path} must be a non-empty string`);
  }
}

function validateAssertion(assertion, path) {
  if (!assertion || typeof assertion !== "object" || Array.isArray(assertion)) {
    throw new TypeError(`${path} must be an object`);
  }
  if (!assertionTypes.has(assertion.type)) {
    throw new TypeError(`${path}.type must be one of ${[...assertionTypes].join(", ")}`);
  }
  if (["includesAll", "includesAny", "excludesAll"].includes(assertion.type)) {
    if (!Array.isArray(assertion.values) || assertion.values.length === 0) {
      throw new TypeError(`${path}.values must be a non-empty array`);
    }
    assertion.values.forEach((value, index) => requireString(value, `${path}.values[${index}]`));
  } else {
    requireString(assertion.pattern, `${path}.pattern`);
    try {
      new RegExp(assertion.pattern, assertion.flags ?? "");
    } catch (cause) {
      throw new TypeError(`${path}.pattern must be a valid regular expression`, { cause });
    }
  }
}

export function validateScenario(scenario) {
  if (!scenario || typeof scenario !== "object" || Array.isArray(scenario)) {
    throw new TypeError("scenario must be an object");
  }
  requireString(scenario.id, "scenario.id");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(scenario.id)) {
    throw new TypeError("scenario.id must use lowercase kebab-case");
  }
  requireString(scenario.name, "scenario.name");
  requireString(scenario.skill, "scenario.skill");
  if (!Array.isArray(scenario.turns) || scenario.turns.length === 0) {
    throw new TypeError("scenario.turns must be a non-empty array");
  }
  scenario.turns.forEach((turn, turnIndex) => {
    requireString(turn?.user, `scenario.turns[${turnIndex}].user`);
    if (!Array.isArray(turn.assertions)) {
      throw new TypeError(`scenario.turns[${turnIndex}].assertions must be an array`);
    }
    turn.assertions.forEach((assertion, assertionIndex) => {
      validateAssertion(assertion, `scenario.turns[${turnIndex}].assertions[${assertionIndex}]`);
    });
  });
  if (!Array.isArray(scenario.rubric) || scenario.rubric.length === 0) {
    throw new TypeError("scenario.rubric must be a non-empty array");
  }
  scenario.rubric.forEach((item, index) => requireString(item, `scenario.rubric[${index}]`));
  return scenario;
}

function comparable(value, caseSensitive) {
  return caseSensitive ? value : value.toLocaleLowerCase("en-US");
}

export function gradeAssertions(text, assertions) {
  if (typeof text !== "string") throw new TypeError("text must be a string");
  if (!Array.isArray(assertions)) throw new TypeError("assertions must be an array");

  return assertions.map((assertion, index) => {
    validateAssertion(assertion, `assertions[${index}]`);
    const caseSensitive = assertion.caseSensitive === true;
    const haystack = comparable(text, caseSensitive);
    let pass;
    let evidence;

    if (["includesAll", "includesAny", "excludesAll"].includes(assertion.type)) {
      const matches = assertion.values.filter((value) => haystack.includes(comparable(value, caseSensitive)));
      if (assertion.type === "includesAll") {
        const missing = assertion.values.filter((value) => !matches.includes(value));
        pass = missing.length === 0;
        evidence = pass ? `Found all required values: ${assertion.values.join(", ")}` : `Missing required values: ${missing.join(", ")}`;
      } else if (assertion.type === "includesAny") {
        pass = matches.length > 0;
        evidence = pass ? `Found accepted value: ${matches[0]}` : `Found none of: ${assertion.values.join(", ")}`;
      } else {
        pass = matches.length === 0;
        evidence = pass ? `Found no forbidden values: ${assertion.values.join(", ")}` : `Found forbidden values: ${matches.join(", ")}`;
      }
    } else {
      const expression = new RegExp(assertion.pattern, assertion.flags ?? "");
      const matched = expression.test(text);
      pass = assertion.type === "matches" ? matched : !matched;
      evidence = pass
        ? `${assertion.type} passed for /${assertion.pattern}/${assertion.flags ?? ""}`
        : `${assertion.type} failed for /${assertion.pattern}/${assertion.flags ?? ""}`;
    }

    return { assertion, pass, evidence };
  });
}
