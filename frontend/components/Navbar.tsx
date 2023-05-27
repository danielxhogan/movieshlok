import styles from "@/styles/components/Navbar.module.css";
import logo from "@/public/logo.png";

import { useEffect, useState } from "react";

import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
} from '@chakra-ui/react'

import Link from "next/link";
import Image from "next/image";

enum AuthMethod {
  LOGIN,
  REGISTER
 }


export default function Navbar() {
  const [ authenticated, setAuthenticated ] = useState(false);
  const [ username, setUsername ] = useState<String | null>(null);

  // set current location in localStorage unless on login or register page
  // used to send user back to the page they were on after successful login
  useEffect(() => {
    const currentLocation = window.location.href;

    if (currentLocation.indexOf("login") === -1 && currentLocation.indexOf("register") === -1) {
      localStorage.setItem("currentLocation", currentLocation);
    }
  }, []);

  // look for auth cookies and set authentication status for the page
  useEffect(() => {
    const cookiesString = document.cookie;
    const cookies = cookiesString.split(";");

    cookies.forEach(cookieString => {
      const cookie = cookieString.split("=");

      if (cookie[0].trim() === "jwt_token") {
        setAuthenticated(true);
      }

      if (cookie[0].trim() === "username") {
        setUsername(cookie[1]);
      }
    });
  }, []);

  function onClickLogOut() {
    document.cookie = "username=";
    document.cookie = "jwt_token=";
    setAuthenticated(false);
    setUsername(null);
  }

  return <>
    <div className={styles["navbar"]}>

      <div className={styles["main-nav"]}>
        <Link href="/">
          <Image
            className={styles["logo"]}
            src={logo}
            alt="logo"
            width={300}
          />
        </Link>

        <div className={styles["main-nav-links"]}>

          {/* authenticated & large screen */}
          { authenticated && username ? <>
              <Link href={`/u/${username}/profile`}> Profile </Link>
              <Link href={`/u/${username}/movies`}> Movies </Link>
              <Link href={`/u/${username}/lists`}> Lists </Link>
              <Link href={`/u/${username}/calendar`}> Calendar </Link>
          </>: <></> }

          {/* large screen */}
          <Link href="/search"> Search </Link>

        </div>
      </div>

      <div className={styles["dropdown"]}>

        {/* small screen */}
        <div className={styles["mag-glass"]}>
          <Link href="/search">
            <i className={`fa-solid fa-magnifying-glass fa-xl ${styles["mag-glass"]}`}></i>
          </Link>
        </div>

        { authenticated && username ?
        <div className={styles["auth-menu"]}>

          {/* authenticated */}
          <Link href="/auth/notifications">
            <i className={`fa-regular fa-bell fa-xl ${styles["bell"]}`}></i>
          </Link>

          <Menu>

            {/* authenticated */}
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              { username }
            </MenuButton>

            <MenuList>
              
              {/* authenticated and small screen */}
              <div className={styles["small-auth-menu"]}>

                <Link href={`/u/${username}/profile`}>
                  <MenuItem command="Profile"></MenuItem>
                </Link>

                <Link href={`/u/${username}/movies`}>
                <MenuItem command="Movies"></MenuItem>
                </Link>

                <Link href={`/u/${username}/lists`}>
                  <MenuItem command="Lists"></MenuItem>
                </Link>

                <Link href={`/u/${username}/calendar`}>
                  <MenuItem command="Calendar"></MenuItem>
                </Link>

                <MenuDivider />
              </div>

              {/* authenticated */}
              <Link href="/auth/account-details">
                <MenuItem command="Account Details"> </MenuItem>
              </Link>

              <MenuItem
                command="Logout"
                className={styles["logout"]}
                onClick={() => onClickLogOut()}>
              </MenuItem>

            </MenuList>

          </Menu>
        {/* end auth-menu */}
        </div>
        :
        <>

        {/* not authenticated */}
        <div className={styles["auth"]}>
          <Link href={"/auth/login"}> Login </Link>

          <div className={styles["register"]}>
            <Link href={"/auth/register"}>
              Register
            </Link>
          </div>
        </div>
        
        </> }
      </div> {/* end dropdown */}

    </div>
  </>
}