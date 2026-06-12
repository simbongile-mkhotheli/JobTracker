import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export function LogoutButton() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
    >
      Sign out
    </button>
  );
}
