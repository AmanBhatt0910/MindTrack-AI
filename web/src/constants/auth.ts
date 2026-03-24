export const AUTH_COPY = {
  login: {
    heading:        "Welcome back",
    subheading:     "Sign in to your MindTrack AI account.",
    submit:         "Sign in",
    loading:        "Signing in…",
    switchText:     "Don't have an account?",
    switchLink:     "Create one",
    switchHref:     "/signup",
    forgotPassword: "Forgot password?",
  },
  signup: {
    heading:    "Create an account",
    subheading: "Start analyzing mental health signals today.",
    submit:     "Create account",
    loading:    "Creating account…",
    switchText: "Already have an account?",
    switchLink: "Sign in",
    switchHref: "/login",
  },
} as const;

export const AUTH_FIELDS = {
  name: {
    label:        "Full name",
    placeholder:  "Ada Lovelace",
    autoComplete: "name",
  },
  email: {
    label:        "Email address",
    placeholder:  "you@example.com",
    autoComplete: "email",
  },
  password: {
    label:        "Password",
    placeholder:  "Min. 6 characters",
    autoComplete: "current-password",
  },
  passwordNew: {
    label:        "Password",
    placeholder:  "Min. 6 characters",
    autoComplete: "new-password",
  },
} as const;

export const AUTH_PANEL_STATS = [
  { value: "94.2%", label: "Accuracy"  },
  { value: "30+",   label: "Languages" },
  { value: "<2s",   label: "Latency"   },
] as const;

export const AUTH_PANEL_QUOTE = {
  text:   "MindTrack AI helps our safety team catch at-risk posts hours before they escalate.",
  author: "Dr. A. Dummy",
  role:   "Clinical Research Lead",
} as const;