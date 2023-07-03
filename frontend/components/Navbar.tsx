import styles from "@/styles/components/Navbar.module.css";
import logo from "@/public/logo.png";
import Searchbar, { SearchbarProps } from "@/components/Searchbar";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { setCredentials, unsetCredentials, selectCredentials, Credentials } from "@/redux/reducers/auth";

import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
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

export default function Navbar(props: SearchbarProps) {
  const router = useRouter();
  const [ authenticated, setAuthenticated ] = useState(false);

  const dispatch = useAppDispatch();
  const credentials = useAppSelector(selectCredentials);


  // set current location in localStorage unless on login or register page
  // used to send user back to the page they were on after successful login
  useEffect(() => {
    const currentLocation = router.asPath;

    if (currentLocation.indexOf("login") === -1 && currentLocation.indexOf("register") === -1) {
      localStorage.setItem("currentLocation", currentLocation);
    }
  }, [router.asPath]);

  async function setCreds(newCredentials: Credentials) {
    await dispatch(setCredentials(newCredentials));
  }

  useEffect(() => {
    const jwt_token = localStorage.getItem("jwt_token");
    const username = localStorage.getItem("username");

    if (jwt_token !== "undefined" && username !== "undefined") {
      setCreds({ jwt_token, username });
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
    dispatch(unsetCredentials());
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("username");
  }


  return <>
    <div className={styles["navbar"]}>
      <div className={styles["nav-flex"]}>


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
              <Link href={`/u/${credentials.username}/ratings`}> Ratings </Link>
              <Link href={`/u/${credentials.username}/watchlist`}> Watchlist </Link>
              <Link href={`/u/${credentials.username}/lists`}> Lists </Link>
          </>: <></> }

        </div>
      </div>

      <Searchbar
        size={"lg"}
        filter={props.filter}
        setParentSeachQuery={props.setParentSeachQuery}
      />

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

                <Link href={`/u/${credentials.username}/ratings`}>
                  <MenuItem command="Ratings"></MenuItem>
                </Link>

                <Link href={`/u/${credentials.username}/watchlist`}>
                  <MenuItem command="Watchlist"></MenuItem>
                </Link>

                <Link href={`/u/${credentials.username}/lists`}>
                  <MenuItem command="Lists"></MenuItem>
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

      <Searchbar
        size={"sm"}
        filter={props.filter}
        setParentSeachQuery={props.setParentSeachQuery}
      />
    </div>
  </>
}