import { page, route, type Auth, type Spec } from "@wasp.sh/spec";

import { LoginPage } from "./LoginPage" with { type: "ref" };
import { SignupPage } from "./SignupPage" with { type: "ref" };
import { getUsernameUserFields } from "./userSignupFields" with { type: "ref" };

// 🔐 Auth out of the box! https://wasp.sh/docs/auth/overview
// Username and password needs no email provider or secrets, so the app boots with zero configuration.
export const authConfig: Auth = {
  userEntity: "User",
  methods: {
    usernameAndPassword: {
      userSignupFields: getUsernameUserFields,
    },
  },
  onAuthFailedRedirectTo: "/login",
  onAuthSucceededRedirectTo: "/",
};

export const authSpec: Spec = [
  route("LoginRoute", "/login", page(LoginPage)),
  route("SignupRoute", "/signup", page(SignupPage)),
];
