import { useSession as useClerkSession } from "@clerk/nextjs";

export const useSession = () => {
  const { session, isLoaded } = useClerkSession();
  return {
    data: session,
    isPending: !isLoaded,
    error: null,
  };
};

// type EmailAuthArgs = {
//   email: string;
//   password: string;
//   name?: string;
// };

type EmailAuthResult = {
  error: { message?: string } | null;
};

export const signIn = {
  // Stubbed implementation for local/email sign-in when using Clerk UI components.
  // Accepts a payload so caller code can be typed correctly, but ignores it at runtime.
  email: async (): Promise<EmailAuthResult> => {
    console.warn(
      "signIn.email is not implemented with Clerk. Use Clerk's <SignIn /> component."
    );
    return { error: null };
  },
};

export const signOut = async () => {
   console.warn("signOut is not implemented with Clerk. Use Clerk's useClerk().signOut().");
   return { error: null };
};

export const signUp = {
  // Stubbed implementation for local/email sign-up when using Clerk UI components.
  email: async (): Promise<EmailAuthResult> => {
    console.warn(
      "signUp.email is not implemented with Clerk. Use Clerk's <SignUp /> component."
    );
    return { error: null };
  },
};

export const authClient = {
  useSession,
  signIn,
  signOut,
  signUp,
};
