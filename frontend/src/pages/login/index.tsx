import { useState, type SyntheticEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { loginUser } from "../../libs/api";

const Login = () => {
  const { login } = useAuth();

  // Three pieces of state: what the user typed, whether we're waiting on the API,
  // and any error message to show
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: SyntheticEvent): Promise<void> => {
    e.preventDefault() // stops the browser from reloading the page
    setError("")       // clear any previous error
    setIsLoading(true)

    try {
      const response = await loginUser({ email, password });
      login(response.user, response.token);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      // finally always runs — makes sure we turn off the spinner
      setIsLoading(false)
    }
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-sm p-8 rounded-lg border border-white/10 bg-[#1a1a1a]">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-sm text-white/50 mt-1">Sign in to your freelancer dashboard</p>
        </div>

        {/* onSubmit goes on the <form>, not onClick on the button */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Email field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm text-white/70">
              Email
            </label>
            {/*
              value + onChange = controlled input.
              e.target.value is the string the user just typed.
            */}
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white
                         placeholder:text-white/25 focus:outline-none focus:border-white/35
                         transition-colors"
            />
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm text-white/70">
              Password
            </label>
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

          {/* Only render the error message when there is one */}
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          {/*
            type="submit" on the button means pressing Enter in any field will trigger onSubmit.
            disabled during loading so the user can't double-submit.
            btn-primary comes from your styles.css custom classes.
          */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full justify-center mt-1"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <div className="border-t border-white/10 mt-4 mb-4 w-full" />
        <p className="text-sm text-white/50 text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-white hover:underline">
            Register
          </Link>
        </p>
      </div>
    </section>
  )
}

export default Login
