import styles from "../../styles/auth/login.module.css";
import logo from "../../public/logo.png";
import Navbar from "@/components/Navbar";

import { FormEvent, useState } from "react";
import { Input, Button } from '@chakra-ui/react';
import Link from 'next/link';
import Image from "next/image";


import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();

const BACKEND_URL = `http://${publicRuntimeConfig.BACKEND_HOST}:${publicRuntimeConfig.BACKEND_PORT}`;


export default function LoginPage() {
  const [ username, setUsername ] = useState("");
  const [ password, setPassword ] = useState("");
  const [ error, setError ] = useState(false);
  const [ errorMessage, setErrorMessage ] = useState("default");


  async function onSubmitLoginForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();


    // construct the request
    const loginUrl = `${BACKEND_URL}/login`;

    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const params = new URLSearchParams();
    params.append("username", username);
    params.append("password", password);

    // send request
    const request = new Request(loginUrl, { headers, body: params, method: "POST" });
    const response = await fetch(request);

    if (response.ok) {
      const responseData = await response.json();
      console.log(responseData);
      document.cookie = `username=${responseData.username}`;
      document.cookie = `jwt_token=${responseData.jwt_token}`;

    } else if (response.status >= 500) {
      setError(true);
      setErrorMessage("Server Error");

    } else {
      const responseJson = await response.json();
      const errorMessage = responseJson.message;
      setError(true);
      setErrorMessage(errorMessage);
    }

    //   // localStorage.setItem("username", username);
    //   // localStorage.setItem("authToken", response.data.data.login.authToken);
    //   // localStorage.setItem("refreshToken", response.data.data.login.refreshToken);

    //   document.cookie = `username=${username}`;
    //   document.cookie = `authToken=${response.data.data.login.authToken}`;
    //   document.cookie = `refreshToken=${response.data.data.login.refreshToken}`;

    //   let postAuthHref = localStorage.getItem("postAuthHref");

    //   if (postAuthHref) {
    //     localStorage.removeItem("postAuthHref");

    //     if(postAuthHref.startsWith("/u")) {
    //       postAuthHref = postAuthHref.replace("null", username);
    //     }
    //     window.location.href = postAuthHref;

    //   } else {
    //     const profile_url = `/u/${username}/profile`;
    //     window.location.href = profile_url;
    //   }
    // }
  }

  return <>
    <Navbar />
    <form className={styles["login-form"]} onSubmit={onSubmitLoginForm}>
      <Image src={logo} alt="logo" width={400} />
      <h1>Login</h1>
      <Input
        type="text"
        variant="filled"
        placeholder="username"
        value={username}
        onChange={e => setUsername(e.target.value)}
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
      <Button type="submit" size="sm" variant="outline" colorScheme='blue'>Login</Button>

      <p className={error ? styles["show-error"] : styles["dont-show-error"]}>
        { errorMessage }
      </p>

      <p>Don&apos;t have an account? <Link href="/auth/register"><span>Login</span></Link></p>
    </form>
  </>
}