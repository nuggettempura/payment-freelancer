import { useState, useEffect, type SyntheticEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useDebounce } from "../../hooks/useDebounce";
import { registerUser, checkEmail } from "../../libs/api";

// Three possible states for the email availability indicator
type EmailStatus = "idle" | "checking" | "available" | "taken";

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailStatus, setEmailStatus] = useState<EmailStatus>("idle");

  // Only update debouncedEmail 500ms after the user stops typing —
  // this is what triggers the API call, not every keystroke.
  const debouncedEmail = useDebounce(email, 500);

  useEffect(() => {
    // Don't check if the field is empty or not a plausible email shape
    if (!debouncedEmail || !debouncedEmail.includes("@")) {
      setEmailStatus("idle");
      return;
    }

    let cancelled = false; // prevents stale responses from a previous check
    setEmailStatus("checking");

    checkEmail(debouncedEmail)
      .then((result) => {
        if (!cancelled) {
          setEmailStatus(result.available ? "available" : "taken");
        }
      })
      .catch(() => {
        if (!cancelled) setEmailStatus("idle");
      });

    // Cleanup: if debouncedEmail changes again before the fetch resolves,
    // mark this request as stale so its result is ignored.
    return () => { cancelled = true; };
  }, [debouncedEmail]);

  const handleSubmit = async (e: SyntheticEvent): Promise<void> => {
    e.preventDefault();
    // Block submit if we already know the email is taken
    if (emailStatus === "taken") return;
    setError("");
    setIsLoading(true);

    try {
      const response = await registerUser({ name, email, password });
      login(response.user, response.token);
      navigate("/payment");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-sm p-8 rounded-lg border border-white/10 bg-[#1a1a1a]">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Create an account</h1>
          <p className="text-sm text-white/50 mt-1">Start managing your freelancer payments</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm text-white/70">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white
                         placeholder:text-white/25 focus:outline-none focus:border-white/35
                         transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="email" className="text-sm text-white/70">Email</label>
              <EmailStatusBadge status={emailStatus} />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailStatus("idle"); // reset immediately on new input
              }}
              placeholder="you@example.com"
              required
              className={`px-3 py-2 rounded-md bg-white/5 border text-white
                          placeholder:text-white/25 focus:outline-none transition-colors
                          ${emailStatus === "taken"
                            ? "border-red-500/70 focus:border-red-500"
                            : emailStatus === "available"
                            ? "border-green-500/70 focus:border-green-500"
                            : "border-white/10 focus:border-white/35"
                          }`}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm text-white/70">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white
                         placeholder:text-white/25 focus:outline-none focus:border-white/35
                         transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading || emailStatus === "taken" || emailStatus === "checking"}
            className="btn-primary w-full justify-center mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="border-t border-white/10 mt-4 mb-4 w-full" />

        <p className="text-sm text-white/50 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-white hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
};

// Separate component so the label row stays readable in JSX above
function EmailStatusBadge({ status }: { status: EmailStatus }) {
  if (status === "idle") return null;
  if (status === "checking") {
    return <span className="text-xs text-white/40">Checking...</span>;
  }
  if (status === "available") {
    return <span className="text-xs text-green-400">Available</span>;
  }
  return <span className="text-xs text-red-400">Already taken</span>;
}

export default Register;