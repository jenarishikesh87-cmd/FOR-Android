
import { supabase } from "./supabase-client.js";

const cleanEmail = (value) =>
  String(value ?? "").trim().toLowerCase();

const cleanUsername = (value) =>
  String(value ?? "").trim().toLowerCase();

export async function registerUser({
  username,
  email,
  password
}) {
  const usernameValue = cleanUsername(username);
  const emailValue = cleanEmail(email);
  const passwordValue = String(password ?? "");

  if (!/^[a-z0-9_]{3,20}$/.test(usernameValue)) {
    throw new Error(
      "Username must be 3–20 characters and use only letters, numbers, or underscores."
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
    throw new Error("Enter a valid email address.");
  }

  if (
    !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s]).{8,}$/
      .test(passwordValue)
  ) {
    throw new Error(
      "Use at least 8 characters with lowercase, uppercase, a number, and a symbol."
    );
  }

  const { data, error } = await supabase.auth.signUp({
    email: emailValue,
    password: passwordValue,
    options: {
      data: {
        username: usernameValue
      }
    }
  });

  if (error) throw error;
  return data;
}

export async function verifyEmailOtp({ email, token }) {
  const emailValue = cleanEmail(email);
  const tokenValue = String(token ?? "").trim();

  if (!/^\d{8}$/.test(tokenValue)) {
    throw new Error("Enter the 8-digit code from your email.");
  }

  const { data, error } = await supabase.auth.verifyOtp({
    email: emailValue,
    token: tokenValue,
    type: "signup"
  });

  if (error) throw error;
  return data;
}

export async function resendEmailOtp({ email }) {
  const emailValue = cleanEmail(email);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
    throw new Error("Enter a valid email address.");
  }

  const { data, error } = await supabase.auth.resend({
    type: "signup",
    email: emailValue
  });

  if (error) throw error;
  return data;
}

export async function loginUser({ email, password }) {
  const { data, error } =
    await supabase.auth.signInWithPassword({
      email: cleanEmail(email),
      password: String(password ?? "")
    });

  if (error) throw error;
  return data;
}

export async function logoutUser() {
  const { error } = await supabase.auth.signOut();

  if (error) throw error;
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) throw error;
  return data.session;
}
