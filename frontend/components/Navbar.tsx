import styles from "@/styles/components/Navbar.module.css";
import logo from "@/public/logo.png";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { setCredentials, unsetCredentials, selectCredentials, Credentials } from "@/redux/reducers/auth";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
} from '@chakra-ui/react'


export default function Navbar() {
  const [ authenticated, setAuthenticated ] = useState(false);

  const dispatch = useAppDispatch();
  const credentials = useAppSelector(selectCredentials);

  // set current location in localStorage unless on login or register page
  // used to send user back to the page they were on after successful login
  useEffect(() => {
    const currentLocation = window.location.href;

    if (currentLocation.indexOf("login") === -1 && currentLocation.indexOf("register") === -1) {
      localStorage.setItem("currentLocation", currentLocation);
    }
  }, []);

  async function setCreds(newCredentials: Credentials) {
    await dispatch(setCredentials(newCredentials));
  }

  useEffect(() => {
    const cookiesString = document.cookie;
    const cookies = cookiesString.split(";");

    const newCredentials: Credentials = {
      jwt_token: null,
      username: null
    };

    cookies.forEach(cookieString => {
      const cookie = cookieString.split("=");

      if (cookie[0].trim() === "jwt_token") {
        newCredentials.jwt_token = cookie[1];
      }

      if (cookie[0].trim() === "username") {
        newCredentials.username = cookie[1];
      }
    });

    if (newCredentials.jwt_token !== null && newCredentials.username !== null) {
      setCreds(newCredentials);
    }
  }, [])

  useEffect(() => {
    if (credentials.jwt_token !== null) {
      setAuthenticated(true);
    } else {
      setAuthenticated(false);
    }
  }, [credentials]);

  function onClickLogOut() {
    document.cookie = "username=";
    document.cookie = "jwt_token=";
    dispatch(unsetCredentials());
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
          { authenticated && credentials.username ? <>
              <Link href={`/u/${credentials.username}/profile`}> Profile </Link>
              <Link href={`/u/${credentials.username}/movies`}> Movies </Link>
              <Link href={`/u/${credentials.username}/lists`}> Lists </Link>
              <Link href={`/u/${credentials.username}/calendar`}> Calendar </Link>
          </>: <></> }

        </div>
      </div>

      <div className={styles["dropdown"]}>

        {/* small screen */}
        { authenticated && credentials.username ?
        <div className={styles["auth-menu"]}>

          {/* authenticated */}
          <Link href="/auth/notifications">
            <i className={`fa-regular fa-bell fa-xl ${styles["bell"]}`}></i>
          </Link>

          <Menu>

            {/* authenticated */}
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              { credentials.username }
            </MenuButton>

            <MenuList>
              
              {/* authenticated and small screen */}
              <div className={styles["small-auth-menu"]}>

                <Link href={`/u/${credentials.username}/profile`}>
                  <MenuItem command="Profile"></MenuItem>
                </Link>

                <Link href={`/u/${credentials.username}/movies`}>
                  <MenuItem command="Movies"></MenuItem>
                </Link>

                <Link href={`/u/${credentials.username}/lists`}>
                  <MenuItem command="Lists"></MenuItem>
                </Link>

                <Link href={`/u/${credentials.username}/calendar`}>
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