import styles from "../../styles/auth/register.module.css";
import logo from "../../public/logo.png";

import axios from "axios";
import { FormEvent, useState } from "react";
import { Input, Link, Button } from '@chakra-ui/react';
import Image from "next/image";

const GRAPHQL_API_URL = "http://localhost/graphql";

export default function RegisterPage() {
  const [ email, setEmail ] = useState("");
  const [ username, setUsername ] = useState("");
  const [ password, setPassword ] = useState("");
  const [ confirmPassword, setConfirmPassword ] = useState("");
  const [ error, setError ] = useState(false);
  const [ errorMessage, setErrorMessage ] = useState("default");

  async function onSubmitLoginForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError(true);
      setErrorMessage("passwords don't match");
      return;
    }

    // const response = await axios({
    //   url: GRAPHQL_API_URL,
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   data: JSON.stringify({
    //     query: `
    //     mutation registerUser($username: String!, $password: String!, $email: String!) {
    //       registerUser(
    //         input: {username: $username, password: $password, email: $email}
    //       ) {
    //         user {
    //           username
    //           jwtAuthToken
    //           jwtRefreshToken
    //         }
    //       }
    //     }
    //     `,
    //     variables: {
    //       username: username,
    //       password: password,
    //       email: email
    //     }
    //   })
    // });
    // console.log(response);

    if (response.data && response.data.errors) {
      setError(true);
      const responseArray = response.data.errors[0].message.split(" ");

      if (responseArray.includes("email")) {
        setErrorMessage("This email address is already registered.");

      } else if (responseArray.includes("username")) {
        setErrorMessage("This username is already registered. Please choose another one.");
      }

    } else {
      const username = response.data.data.registerUser.user.username;

      // localStorage.setItem("username", username);
      // localStorage.setItem("authToken", response.data.data.registerUser.user.jwtAuthToken);
      // localStorage.setItem("refreshToken", response.data.data.registerUser.user.jwtRefreshToken);

      document.cookie = `username=${username}`;
      // document.cookie = `authToken=${response.data.data.login.authToken}`;
      // document.cookie = `refreshToken=${response.data.data.login.refreshToken}`;

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

  function onClickLoginButton() {
    const postAuthHref = localStorage.getItem("postAuthHref");
    if (!postAuthHref) {
      localStorage.setItem("postAuthHref", window.location.href);
    }
    window.location.href = "/auth/login";
  }

  return <>
    <form className={styles["register-form"]} onSubmit={onSubmitLoginForm}>
      <Image src={logo} alt="logo" width={400} />
      <h1>Register</h1>
      <Input
        type="email"
        variant="filled"
        placeholder="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
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
      <Input
        type="password"
        variant="filled"
        placeholder="confirm password"
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
        required
      />
      <Button type="submit" size="sm" variant="outline" colorScheme='blue'>Register</Button>
      <p
        className={error ? styles["show-error"] : styles["dont-show-error"]}
      >
        {errorMessage}
      </p>
      <p>Already have an account? <span onClick={onClickLoginButton}>Login</span></p>

    </form>
  </>
}