import styles from "../../styles/auth/login.module.css";
import logo from "../../public/logo.png";

import axios from "axios";
import { FormEvent, useState } from "react";
import { Input, Link, Button } from '@chakra-ui/react';
import Image from "next/image";

const GRAPHQL_API_URL = "http://localhost/graphql";

export default function LoginPage() {
  const [ username, setUsername ] = useState("");
  const [ password, setPassword ] = useState("");
  const [ error, setError ] = useState(false);


  async function onSubmitLoginForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const response = await axios({
      url: GRAPHQL_API_URL,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify({
        query: `
        mutation login($password: String!, $username: String!) {
          login(input: {password: $password, username: $username}) {
            authToken
            refreshToken
            user {
              username
            }
          }
        }
        `,
        variables: {
         username: username,
         password: password 
        }
      })
    })


    if (response.data && response.data.errors) {
      setError(true);
    } else {
      const username = response.data.data.login.user.username;

      localStorage.setItem("username", username);
      localStorage.setItem("authToken", response.data.data.login.authToken);
      localStorage.setItem("refreshToken", response.data.data.login.refreshToken);

      document.cookie = `username=${username}`;
      document.cookie = `authToken=${response.data.data.login.authToken}`;
      document.cookie = `refreshToken=${response.data.data.login.refreshToken}`;

      let postAuthHref = localStorage.getItem("postAuthHref");

      if (postAuthHref) {
        localStorage.removeItem("postAuthHref");

        if(postAuthHref.startsWith("/u")) {
          postAuthHref = postAuthHref.replace("null", username);
        }
        window.location.href = postAuthHref;

      } else {
        const profile_url = `/u/${username}/profile`;
        window.location.href = profile_url;
      }
    }
  }

  function onClickRegisterButton() {
    const postAuthHref = localStorage.getItem("postAuthHref");
    if (!postAuthHref) {
      localStorage.setItem("postAuthHref", window.location.href);
    }
    window.location.href = "/auth/register";
  }

  return <>
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
        Incorrect username or password
      </p>
      <p>Don&apos;t have an account? <span onClick={onClickRegisterButton}>Register</span></p>

    </form>
  </>
}