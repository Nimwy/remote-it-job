import { apiFetch } from "../lib/api";
import type { User } from "../types";

export function register(data: {
  name: string;
  email: string;
  password: string;
  company_name: string;
}): Promise<User> {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function login(data: { email: string; password: string }): Promise<User> {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function logout(): Promise<void> {
  return apiFetch("/auth/logout", { method: "POST" });
}

export function me(): Promise<User> {
  return apiFetch("/auth/me");
}

export function changePassword(data: {
  current_password: string;
  new_password: string;
}): Promise<void> {
  return apiFetch("/auth/change-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
