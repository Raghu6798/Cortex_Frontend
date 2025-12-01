import { useSession as useClerkSession } from "@clerk/nextjs";

export const useSession = () => {
  const { session, isLoaded } = useClerkSession();
  return {
    data: session,
    isPending: !isLoaded,
    error: null,
  };
};

export const signIn = {
  email: async () => {
    console.warn("signIn.email is not implemented with Clerk. Use Clerk's <SignIn /> component.");
    return { error: null };
  },
};

export const signOut = async () => {
   console.warn("signOut is not implemented with Clerk. Use Clerk's useClerk().signOut().");
   return { error: null };
};

export const signUp = {
  email: async () => {
    console.warn("signUp.email is not implemented with Clerk. Use Clerk's <SignUp /> component.");
    return { error: null };
  },
};

export const authClient = {
  useSession,
  signIn,
  signOut,
  signUp,
};
