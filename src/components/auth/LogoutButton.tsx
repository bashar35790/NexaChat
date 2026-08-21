"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLogout } from "@/hooks/useLogout";

export function LogoutButton() {
  const logout = useLogout();
  return (
    <Button variant="ghost" size="sm" onClick={logout}>
      <LogOut className="h-4 w-4" />
      Log out
    </Button>
  );
}
