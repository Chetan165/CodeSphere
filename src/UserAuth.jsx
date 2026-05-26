import toast from "react-hot-toast";
const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
let redirectScheduled = false;

const showAuthToast = (message, id) => {
  toast.error(message, { id });
};

const redirectAfterToast = (path) => {
  if (redirectScheduled) return;
  redirectScheduled = true;
  setTimeout(() => {
    window.location.replace(path);
  }, 1000);
};

const UserAuth = async (setUser, AdminCheck = false) => {
  try {
    const response = await fetch(`${backendURL}/api/user`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const body = await response.json().catch(() => ({}));

    if (response.ok) {
      if (body && body.uid) {
        if (AdminCheck && body.admin !== true) {
          showAuthToast("Admin access required", "auth-admin-required");
          redirectAfterToast("/dashboard");
          return { ok: false, reason: "admin_required", data: body };
        }

        setUser(body);
        localStorage.setItem("CodeSphereUserData", JSON.stringify(body));
        return { ok: true, data: body };
      }

      showAuthToast("Unauthorized", "auth-unauthorized");
      redirectAfterToast("/");
      return { ok: false, reason: "unauthorized", data: body };
    }

    if (body.loggedIn === false) {
      showAuthToast("Please login first", "auth-not-logged-in");
      redirectAfterToast("/");
      return { ok: false, reason: "not_logged_in" };
    }

    if (body.loggedIn === true && body.registered === false) {
      showAuthToast(body.error || "User not registered", "auth-not-registered");
      redirectAfterToast("/register");
      return { ok: false, reason: "not_registered", data: body };
    }

    if (body.registered === true && body.sessionValid === false) {
      showAuthToast(
        body.error || "Session active elsewhere",
        "auth-session-invalid",
      );
      redirectAfterToast("/");
      return { ok: false, reason: "session_invalid" };
    }

    showAuthToast(body.error || "Unauthorized", "auth-unauthorized-fallback");
    redirectAfterToast("/");
    return { ok: false, reason: "unauthorized", data: body };
  } catch (error) {
    console.error("Error fetching user:", error);
    showAuthToast("Network error", "auth-network-error");
    return { ok: false, reason: "network_error" };
  }
};

export default UserAuth;
