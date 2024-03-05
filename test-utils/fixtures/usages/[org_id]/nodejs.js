dvcClient.variable(user, "special-character-path", true);
dvcClient.variable(user, "special-character-path", false);

dvcClient.variable(user, "single-quotes", "word");

checkVariable(user, "func-proxy", 7);

myClient.variable(user, "alias-case", {});

dvcClient.variable(user, "multi-line", true);

// dvcClient.variable(user, "single-comment", 10)

/**
 * dvcClient.variable(user, "multi-line-comment", false)
 */

dvcClient.variable({ user_id: "id", email: "blah" }, "user-object", true);
dvcClient.variable(new User("user_id"), "user-constructor", true);
dvcClient.variable(
  {
    user_id: "id",
    email: "blah",
  },
  "multi-line-user-object",
  true,
);
dvcClient.variable(user, VARIABLES.ENUM_VARIABLE, true);
dvc.variable(user, "renamed-case", true);
dvcClient.variable(user, "variable-from-api", true);

const assignedToAVar = useVariable("multiline-extra-comma", false)?.value;
