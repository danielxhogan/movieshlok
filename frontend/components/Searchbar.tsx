import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { getSearchResults, SearchParams } from "@/redux/actions/tmdb";
import { selectSearchResults } from "@/redux/reducers/tmdb";
import { FilterResults } from "@/pages/search";

import { useState } from "react";
import { InputGroup, InputLeftElement, Input } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";

interface Props {
  filter?: FilterResults;
  setParentSeachQuery?: Function;
}

export default function Searchbar(props: Props) {
  const dispatch = useAppDispatch();
  const searchResults = useAppSelector(selectSearchResults);

  let defaultFilter: FilterResults;
  if (props.filter !== undefined) { defaultFilter = props.filter; }
  else { defaultFilter = FilterResults.ALL; }

  const [ searchQuery, setSearchQuery ] = useState(searchResults.query);

  function onChangeSearchQuery(value: string) {
    setSearchQuery(value);
    if (props.setParentSeachQuery !== undefined) {
      props.setParentSeachQuery(value);
    }
  }

  function onSubmitSearchForm(e) {
    e.preventDefault();

    if (searchQuery !== "") {
      const searchParams: SearchParams = {
        query: searchQuery,
        page: "1",
        filter: defaultFilter 
      };

      dispatch(getSearchResults(searchParams));
    }
  }


  return <>
    <form onSubmit={onSubmitSearchForm}>
      <InputGroup>
        <InputLeftElement
          pointerEvents='none'
          children={<SearchIcon color='gray.500' />}
        />
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