import styles from "@/styles/auth/register.module.css";
import logo from "@/public/logo.png";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { FormEvent, useState } from "react";
import { Input, Button } from "@chakra-ui/react";
import Link from "next/link";
import Image from "next/image";

import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const BACKEND_URL = `http://${publicRuntimeConfig.BACKEND_HOST}:${publicRuntimeConfig.BACKEND_PORT}`;

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("default");

  async function onSubmitRegisterForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // check passwords match
    if (password !== confirmPassword) {
      setError(true);
      setErrorMessage("passwords don't match");
      return;
    }

    // construct the request
    const registerUrl = `${BACKEND_URL}/register`;

    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const params = new URLSearchParams();
    params.append("username", username);
    params.append("email", email);
    params.append("password", password);

    // send request
    const request = new Request(registerUrl, {
      headers,
      body: params,
      method: "POST"
    });
    const response = await fetch(request);

    if (response.ok) {
      window.location.href = "/auth/login";
    } else if (response.status >= 500) {
      setError(true);
      setErrorMessage("Server Error");
    } else {
      const responseJson = await response.json();
      const errorMessage = responseJson.message;
      setError(true);
      setErrorMessage(errorMessage);
    }
  }

  return (
    <div className={"wrapper"}>
      <Navbar />

      <form className={styles["register-form"]} onSubmit={onSubmitRegisterForm}>
        <Image src={logo} alt="logo" width={400} />
        <h1>Register</h1>

        <Input
          type="text"
          variant="filled"
          placeholder="username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <Input
          type="email"
          variant="filled"
          placeholder="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          variant="filled"
          placeholder="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <Input
          type="password"
          variant="filled"
          placeholder="confirm password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />
        <Button type="submit" size="sm" variant="outline" colorScheme="blue">
          Register
        </Button>

        <p className={error ? styles["show-error"] : styles["dont-show-error"]}>
          {errorMessage}
        </p>

        <p>
          Already have an account?{" "}
          <Link href="/auth/login">
            <span>Login</span>
          </Link>
        </p>
      </form>

      <Footer />
    </div>
  );
}
