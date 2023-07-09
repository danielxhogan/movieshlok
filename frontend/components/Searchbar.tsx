import styles from "@/styles/components/Searchbar.module.css";
import { useAppSelector } from "@/redux/hooks";
import { selectSearchResults } from "@/redux/reducers/tmdb";
import { FilterResults } from "@/pages/search";

import { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import { InputGroup, InputLeftElement, Input } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";

import { NavbarProps } from "@/components/Navbar";

interface SearchbarProps {
  navbarProps: NavbarProps,
  size: string;
}

export default function Searchbar(props: SearchbarProps) {
  const searchResults = useAppSelector(selectSearchResults);
  const router = useRouter();

  let defaultSearchQuery: string;

  if (typeof router.query.query === "string") {
    defaultSearchQuery = router.query.query;
  } else {
    defaultSearchQuery = "";
  }

  const [ searchQuery, setSearchQuery ] = useState(defaultSearchQuery);


  useEffect(() => {
    if (searchResults.status === "fulfilled") {
      setSearchQuery(searchResults.query);
    }
  }, [searchResults])


  function onChangeSearchQuery(value: string) {
    setSearchQuery(value);
    if (props.navbarProps.setParentSeachQuery !== undefined) {
      props.navbarProps.setParentSeachQuery(value);
    }
  }

  function onSubmitSearchForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    let defaultFilter: FilterResults;
    if (props.navbarProps.filter !== undefined) { defaultFilter = props.navbarProps.filter; }
    else { defaultFilter = FilterResults.ALL; }

    if (searchQuery !== "") {
      router.push(`/search?query=${searchQuery}&filter=${defaultFilter}&page=1`);
    }
  }

  return <>
    <form
      onSubmit={onSubmitSearchForm}
      className={`${styles["wrapper"]} ${styles[props.size]}`}
      >
      {/* @ts-ignore */}
      <InputGroup>
        <InputLeftElement
          pointerEvents='none'
        >
          <SearchIcon color="gray.500" />
        </ InputLeftElement>
        <Input
          type="text"
          variant="filled"
          placeholder="search movies, or cast & crew"
          value={searchQuery}
          onChange={e => onChangeSearchQuery(e.target.value)}
        />
      </InputGroup>
    </form>
  </>;
}