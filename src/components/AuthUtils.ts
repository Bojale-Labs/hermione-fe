import { auth } from "@canva/user";
import { AuthState } from "./RenderSIgnInFlow";

export const checkAuthenticationStatus = async (
  email: string,
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>
): Promise<"checking" | "authenticated" | "not_authenticated" | "error"> => {
  try {
    const token = await auth.getCanvaUserToken();
    const res = await fetch(
      `${BACKEND_HOST}/api/canva/authentication/status?platform=canva&email=${email}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: "POST",
      }
    );
    const body = await res.json();

    if (body?.isAuthenticated) {
      setAuthState("authenticated");
      return "authenticated";
    } else {
      return "not_authenticated";
    }
  } catch (error) {
    console.error(error);
    return "error";
  }
};

export const startAuthenticationFlow = async (
  email: string,
  otp: string,
  // handleAuthStatus,
  setState: React.Dispatch<
    React.SetStateAction<
      "checking" | "authenticated" | "not_authenticated" | "error"
    >
  >
) => {
  try {
    const response = await auth.requestAuthentication();
    switch (response.status) {
      case "COMPLETED":
        checkAuthenticationStatus(email, setState);
        break;
      case "ABORTED":
        console.warn("Authentication aborted by user.");
        setState("not_authenticated");
        break;
      case "DENIED":
        console.warn("Authentication denied by user", response.details);
        setState("not_authenticated");
        break;
    }
  } catch (e) {
    console.error(e);
    setState("error");
  }
};

export const requestOTP = async (email: string): Promise<Response> => {
  return fetch(`${BACKEND_HOST}/api/otps/email/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      deduplication_key: crypto.randomUUID(),
    },
    body: JSON.stringify({ email, source: "BOJALELABS" }),
  });
};

export const validateOTP = async (
  email: string,
  otp: string
): Promise<Response> => {
  return fetch(`${BACKEND_HOST}/api/otps/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, otp }),
  });
};

// export const authenticateOTP = async (
//   email: string,
//   otp: string
// ): Promise<Response> => {
//   return fetch(`${BACKEND_HOST}/api/otps/authenticate`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ email, otp, service: "CANVA_APP" }),
//   });
// };
