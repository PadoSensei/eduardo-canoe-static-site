import React, { useEffect } from "react";
import { supabase } from "../../supabaseClient";
import config from "../../core/config";

interface AdminAuthProviderProps {
  children: React.ReactNode;
}

const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!config.isProduction) {
        // eslint-disable-next-line no-console
        console.log(
          `🔐 AUTH_EVENT: ${event} | User: ${session?.user?.email || "NONE"}`
        );
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return <>{children}</>;
};

export default AdminAuthProvider;
