import styles from "@/styles/Navbar.module.css";
import logo from "@/public/logo.png";

import { useEffect, useState } from "react";
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

const WORDPRESS_URL = "http://localhost";

enum AuthMethod {
  LOGIN,
  REGISTER
 }

export default function Navbar() {
  const [ username, setUsername ] = useState<String | null>(null);

  useEffect(() => {
    setUsername(localStorage.getItem("username"));
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

  function onClickNotificationBell() {
    window.location.href = "/auth/notifications";
  }

  function onClickAccountDetails() {
    console.log("accountdetails");
    console.log(document.cookie);

    window.location.href = "/auth/account-details";

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

        <div
          className={styles["link"]}
          onClick={() => { window.location.href = "/m/search"; }}>
          Search
        </div>

        <div
          className={styles["link"]}
          onClick={() => { window.location.href = `${WORDPRESS_URL}/blog`; }}>
          Blog
        </div>
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
            <i
              className={`fa-solid fa-magnifying-glass fa-xl ${styles["mag-glass"]}`}
              onClick={() => { window.location.href = "/m/search"; }}>
            </i>
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
          <i
            className={`fa-solid fa-magnifying-glass fa-xl ${styles["mag-glass"]}`}
            onClick={() => { window.location.href = "/m/search"; }}>
          </i>
          <i
            className={`fa-regular fa-bell fa-xl ${styles["bell"]}`}
            onClick={onClickNotificationBell}>
          </i>
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
                <MenuItem
                  command="Account Details"
                  className={styles["link"]}
                  onClick={() => onClickAccountDetails()}
                  >
                </MenuItem>
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