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

  // useEffect(() => {
  //   setUsername(localStorage.getItem("username"));
  //   document.cookie = `username=${localStorage.getItem("username")}`;
  // }, [])

  function onClickLogOut() {
    localStorage.removeItem("username");
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");

    window.location.reload();
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
              <Link href={`/u/${username}/profie`}> Profile </Link>
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
        <div clssName={styles["auth-menu"]}>

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

                <Link href={`/u/${username}/profie`}>
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