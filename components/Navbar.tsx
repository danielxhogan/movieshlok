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
  Link
} from '@chakra-ui/react'

import NextLink from "next/link";
import Image from "next/image";

const WORDPRESS_URL = "http://localhost";

enum AuthMethod {
  LOGIN,
  REGISTER
 }

export default function Navbar() {
  const [ username, setUsername ] = useState<String | null>(null);

  useEffect(() => {
    setUsername(localStorage.getItem("username"));

    document.cookie = `username=${localStorage.getItem("username")}`;
    document.cookie = `authToken=${localStorage.getItem("authToken")}`;
    document.cookie = `refreshToken=${localStorage.getItem("refreshToken")}`;
  }, [])

  function onClickAuthenticatedLink(link: String) {
    const username = localStorage.getItem("username");
    const destination = `/u/${username}/${link}`;

    if ( !username ) { authenticate(null, AuthMethod.LOGIN, destination); }
    else { window.location.href = `/u/${username}/${link}`; }
  }

  function authenticate(
    _: React.MouseEvent<HTMLDivElement, MouseEvent> | React.MouseEvent<HTMLButtonElement, MouseEvent> | null,
    method: AuthMethod,
    destination: string | null = null
  ) {
    const postAuthHref = localStorage.getItem("postAuthHref");

    if ( !postAuthHref ) {
      if (destination) {
        localStorage.setItem("postAuthHref", destination);
      } else {
        localStorage.setItem("postAuthHref", window.location.href);
      }
    }

    switch (method) {
      case AuthMethod.LOGIN:
        window.location.href = "/auth/login";
        break;
      case AuthMethod.REGISTER:
        window.location.href = "/auth/register";
        break;
    }
  }

  function onClickLogOut() {
    localStorage.removeItem("username");
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");

    window.location.reload();
  }

  return <>
    <div className={styles["links"]}>
      <div className={styles["main-nav"]}>
        <Image
          className={styles["logo"]}
          src={logo}
          alt="logo"
          width={300}
          onClick={ () => { window.location.href = WORDPRESS_URL}}
        />

        <div
          className={styles["link"]}
          onClick={() => onClickAuthenticatedLink("profile")}>
          Profile
        </div>

        <div
          className={styles["link"]}
          onClick={() => onClickAuthenticatedLink("movies")}>
          Movies
        </div>

        <div
          className={styles["link"]}
          onClick={() => onClickAuthenticatedLink("lists")}>
          Lists
        </div>

        <div
          className={styles["link"]}
          onClick={() => onClickAuthenticatedLink("calendar")}>
          Calendar
        </div>

        <Link as={NextLink} href="/search">
          <div
            className={styles["link"]}
            >
            Search
          </div>
        </Link>

        <Link as={NextLink} href={`${WORDPRESS_URL}/blog`}>
          <div
            className={styles["link"]}
            >
            Blog
          </div>
        </Link>
      </div>

      <div className={styles["account"]}>

        { !username
        ?
        <div className={styles["auth"]}>
          <div
            className={styles["link"]}
            onClick={e => authenticate(e, AuthMethod.REGISTER)}>
            Register
          </div>
          <div
            className={styles["link"]}
            onClick={e => authenticate(e, AuthMethod.LOGIN)}>
            Login
          </div>

          <div className={styles["no-auth-menu"]}>
            <Link as={NextLink} href="/search">
              <i
                className={`fa-solid fa-magnifying-glass fa-xl ${styles["mag-glass"]}`}
                // onClick={() => { window.location.href = "/m/search"; }}
                >
              </i>
            </Link>

            <Menu >
              <MenuButton as={Button}>
                <i className="fa-solid fa-bars fa-2x"></i>
              </MenuButton>
              <MenuList>
                <MenuItem
                  command="Login"
                  className={styles["link"]}
                  onClick={e => authenticate(e, AuthMethod.LOGIN)}>
                </MenuItem>
                <MenuItem
                  command="Register"
                  className={styles["link"]}
                  onClick={e => authenticate(e, AuthMethod.REGISTER)}>
                </MenuItem>
                <MenuDivider />
                <MenuItem
                  command="Profile"
                  className={styles["link"]}
                  onClick={() => onClickAuthenticatedLink("profile")}>
                </MenuItem>
                <MenuItem
                  command="Movies"
                  className={styles["link"]}
                  onClick={() => onClickAuthenticatedLink("movies")}>
                </MenuItem>
                <MenuItem
                  command="Lists"
                  className={styles["link"]}
                  onClick={() => onClickAuthenticatedLink("lists")}>
                </MenuItem>
                <MenuItem
                  command="Calendar"
                  className={styles["link"]}
                  onClick={() => onClickAuthenticatedLink("calendar")}>
                </MenuItem>
                <MenuItem
                  command="Blog"
                  className={styles["link"]}
                  onClick={() => { window.location.href = `${WORDPRESS_URL}/blog`; }}>
                </MenuItem>
              </MenuList>
            </Menu>

          </div>
        </div>
        :
        <div className={styles["auth-menu"]}>

          <Link as={NextLink} href="/search">
            <i className={`fa-solid fa-magnifying-glass fa-xl ${styles["mag-glass"]}`}></i>
          </Link>
          <Link as={NextLink} href="/auth/notifications">
            <i className={`fa-regular fa-bell fa-xl ${styles["bell"]}`}></i>
          </Link>

          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              { username }
            </MenuButton>

            <MenuList>
              <div className={styles["small-auth-menu"]}>
                <MenuItem
                  command="Profile"
                  className={styles["link"]}
                  onClick={() => onClickAuthenticatedLink("profile")}>
                </MenuItem>
                <MenuItem
                  command="Movies"
                  className={styles["link"]}
                  onClick={() => onClickAuthenticatedLink("movies")}>
                </MenuItem>
                <MenuItem
                  command="Lists"
                  className={styles["link"]}
                  onClick={() => onClickAuthenticatedLink("lists")}>
                </MenuItem>
                <MenuItem
                  command="Calendar"
                  className={styles["link"]}
                  onClick={() => onClickAuthenticatedLink("calendar")}>
                </MenuItem>
                <MenuItem
                  command="Blog"
                  className={styles["link"]}
                  onClick={() => { window.location.href = `${WORDPRESS_URL}/blog`; }}>
                </MenuItem>
                <MenuDivider />
              </div>

              <Link as={NextLink} href="/auth/account-details">
                <MenuItem
                  command="Account Details"
                  className={styles["link"]}>
                </MenuItem>
              </Link>
              <MenuItem
                command="Logout"
                className={styles["link"]}
                onClick={() => onClickLogOut()}>
              </MenuItem>
            </MenuList>
          </Menu>

        </div>
        }
        
      </div>

    </div>
  </>
}