"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation"; // "next/router" // this is outdated
import Link from "next/link";
import Field from "./Field";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";

export default function AuthForm() {
  const [mode, setMode] = useState("login");
  const [errors, setErrors] = useState({ confirm: "", form: "" });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const confirmRef = useRef(null);
  const router = useRouter();

  const { user, logout, isAuthenticated, login } = useAuth();
  // useContext(AuthContext); this is already done in the useAuth that we are exporting

  const isLogin = mode === "login";

  async function handleLogin(e) {
    e.preventDefault();
    try {
      await login(email, password);
      setErrors((prev) => ({ ...prev, form: "" }));
      router.replace("/"); // history ["/", "/"]
    } catch (err) {
      setErrors((prev) => ({ ...prev, form: err.message }));
    }
  }

  async function sendSignupRequest() {
    const formData = {
      name,
      email,
      password,
    };

    const response = await fetch("http://localhost:8080/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const jsonResponse = await response.json();
      throw new Error(jsonResponse.error || "Signup failed");
    }

    const data = await response.json();
    setErrors((prev) => ({ ...prev, form: "" }));
    return data;
  }

  async function handleSignup(e) {
    e.preventDefault();
    // TODO: validate the fields (e.g. password === confirm),
    // call your signup API, then log the user in / redirect to "/".

    if (password !== confirm) {
      setErrors((prev) => ({ ...prev, confirm: "Passwords do not match" }));
      confirmRef.current?.focus();
      return;
    }

    setErrors((prev) => ({ ...prev, confirm: "" }));

    // make the post request
    try {
      await sendSignupRequest();
      await login(email, password);
      router.replace("/");
    } catch (err) {
      setErrors((prev) => ({ ...prev, form: err.message }));
    }
  }

  return (
    <div className="w-full max-w-md neon-border bg-panel rounded-lg p-8">
      <Link
        href="/"
        className="block text-center text-primary neon-text font-bold tracking-[0.3em] mb-1 cursor-pointer"
      >
        DEVFORGE
      </Link>

      <p className="text-center text-xs text-muted tracking-widest mb-8">
        {"// access_terminal"}
      </p>

      <form
        onSubmit={isLogin ? handleLogin : handleSignup}
        className="flex flex-col gap-4"
      >
        {!isLogin && (
          <Field
            id="name"
            label="name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((prev) => ({ ...prev, confirm: "" }));
            }}
            placeholder="n3on_rider"
          />
        )}

        <Field
          label="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@grid.net"
        />

        <Field
          id="password"
          label="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors((prev) => ({ ...prev, confirm: "" }));
          }}
          placeholder="••••••••"
        />

        {!isLogin && (
          <Field
            id="confirm-password"
            label="confirm password"
            type="password"
            value={confirm}
            inputRef={confirmRef}
            onChange={(e) => {
              setConfirm(e.target.value);
              setErrors((prev) => ({ ...prev, confirm: "" }));
            }}
            error={errors.confirm}
            placeholder="••••••••"
          />
        )}

        {errors.form && (
          <p
            role="alert"
            aria-live="polite"
            className="text-xs text-red-400 tracking-widest"
          >
            {"// "}
            {errors.form}
          </p>
        )}

        <Button type="submit" variant="primary" className="mt-2 w-full">
          {isLogin ? "Log in" : "Register"}
        </Button>
      </form>

      <p className="text-center text-xs text-muted mt-6">
        {isLogin ? "No account yet? " : "Already wired in? "}
        <button
          type="button"
          onClick={() => {
            setMode(isLogin ? "signup" : "login");
            setErrors({ confirm: "" });
          }}
          className="text-primary hover:text-primary-strong underline underline-offset-4 cursor-pointer"
        >
          {isLogin ? "Register" : "Log in"}
        </button>
      </p>

      <Link
        href="/"
        className="block text-center text-xs text-muted hover:text-primary mt-4 cursor-pointer"
      >
        ← back to home
      </Link>
    </div>
  );
}
