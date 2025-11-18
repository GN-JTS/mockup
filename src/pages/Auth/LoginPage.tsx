import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";

const LoginPage = () => {
  const { login } = useAuth();
  const { showToast } = useNotifications();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      showToast("Login successful!", "success");
    } catch (error) {
      showToast("Invalid credentials", "error");
    } finally {
      setLoading(false);
    }
  };

  // Quick login options for demo
  const quickLogins = [
    { role: "Employee", email: "alex.emp@jts.com" },
    { role: "Manager", email: "emily.manager@jts.com" },
    { role: "Training Manager", email: "lisa.training@jts.com" },
    { role: "Mentor", email: "robert.mentor@jts.com" },
    { role: "Evaluator", email: "patricia.eval@jts.com" },
    { role: "Admin", email: "sarah.admin@jts.com" },
  ];

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password");
  };

  return (
    <div className="card bg-white shadow-xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">JTS System</h1>
        <p className="text-gray-600 mt-2">Job Training Standard Management</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="your.email@jts.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="mt-8 pt-8 border-t border-gray-200">
        <p className="text-sm text-gray-600 mb-3 text-center">
          Quick Login (Demo)
        </p>
        <div className="grid grid-cols-2 gap-2">
          {quickLogins.map(({ role, email: demoEmail }) => (
            <button
              key={role}
              onClick={() => handleQuickLogin(demoEmail)}
              className="btn btn-secondary text-sm"
            >
              {role}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 text-center mt-3">
          Password:{" "}
          <code className="bg-gray-100 px-2 py-1 rounded">password</code>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
