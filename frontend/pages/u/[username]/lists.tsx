import styles from "@/styles/u/ListsPage.module.css";
import Navbar from "@/components/Navbar";
import ProfileNav from "@/components/ProfileNav";
import Footer from "@/components/Footer";

import { useDispatch } from "react-redux";
import { useAppSelector } from "@/redux/hooks";
import { unsetCredentials } from "@/redux/reducers/auth";
import { selectCredentials } from "@/redux/reducers/auth";
import {
  getLists,
  createList,
  deleteList,
  DeleteListRequest,
  List,
  GetListsRequest,
  NewList
} from "@/redux/actions/lists";

import {
  selectLists,
  selectNewList,
  selectDeletedList,
  addNewList,
  resetNewList,
  removeDeletedList,
  resetDeletedList
} from "@/redux/reducers/lists";

import { useRouter } from "next/router";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalHeader,
  Button,
  ModalCloseButton,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Spinner
} from "@chakra-ui/react";

export default function ListsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const credentials = useAppSelector(selectCredentials);
  const lists = useAppSelector(selectLists);
  const newList = useAppSelector(selectNewList);
  const deletedList = useAppSelector(selectDeletedList);

  const [newListTitle, setNewListTitle] = useState("");
  const [deletingList, setDeletingList] = useState<List>();

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (typeof router.query.username === "string") {
      const getListsRequest: GetListsRequest = {
        username: router.query.username
      };

      dispatch<any>(getLists(getListsRequest));
    }
  }, [dispatch, router.query.username]);

  function onSubmitNewList(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (
      credentials.jwt_token &&
      credentials.username === router.query.username
    ) {
      const newList: NewList = {
        jwt_token: credentials.jwt_token,
        name: newListTitle
      };

      dispatch<any>(createList(newList));
    }
  }

  // this useEffect detects when a new list is created
  // and updates the list of lists in the redux store
  useEffect(() => {
    if (
      newList.status === "fulfilled" &&
      newList.success === true &&
      newList.list
    ) {
      setNewListTitle("");
      dispatch(addNewList({ newList: newList.list }));
      dispatch(resetNewList());
    } else if (newList.status === "fulfilled" && newList.code === 401) {
      toast({
        title: "You need to log in again",
        description: "",
        status: "error",
        duration: 3000,
        isClosable: true
      });

      dispatch(resetNewList());
      dispatch(unsetCredentials());
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("username");
    }
  }, [newList, dispatch, toast]);

  function onClickDeleteList(list: List) {
    setDeletingList(list);
    onOpen();
  }

  function dispatchDeleteList() {
    if (credentials.jwt_token && deletingList) {
      const deleteRequest: DeleteListRequest = {
        jwt_token: credentials.jwt_token,
        list_id: deletingList.id
      };

      dispatch<any>(deleteList(deleteRequest));
    }
  }

  useEffect(() => {
    onClose();

    if (
      deletedList.status === "fulfilled" &&
      deletedList.success === true &&
      deletedList.list
    ) {
      dispatch(removeDeletedList({ list_id: deletedList.list.id }));
      dispatch(resetDeletedList());
    } else if (deletedList.status === "fulfilled" && deletedList.code === 401) {
      toast({
        title: "You need to log in again",
        description: "",
        status: "error",
        duration: 3000,
        isClosable: true
      });

      dispatch(resetDeletedList());
      dispatch(unsetCredentials());
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("username");
    }
  }, [deletedList, dispatch, onClose, toast]);

  function makeList(list: List) {
    if (list.watchlist) {
      return;
    }
    return (
      <div className={styles["list"]}>
        <Link
          href={`/u/${router.query.username}/list/${list.id}?name=${list.name}`}
          className={styles["list-name"]}
        >
          <div className={styles["list-name-text"]}>{list.name}</div>
        </Link>

        {credentials.username === router.query.username && (
          // @ts-ignore
          <Tooltip label={"delete list"} placement="top">
            <i
              className={`${styles["delete-list"]} fa-solid fa-trash fa-md`}
              onClick={() => onClickDeleteList(list)}
            />
          </Tooltip>
        )}
      </div>
    );
  }

  return (
    <div className="wrapper">
      <Navbar />

      <div className="content">
        <ProfileNav />

        <h1 className="page-title">
          <span className="username">{router.query.username}&apos;s</span> Lists
        </h1>

        {credentials.jwt_token &&
          credentials.username === router.query.username && (
            <form
              onSubmit={onSubmitNewList}
              className={styles["new-list-form"]}
            >
              {/* @ts-ignore */}
              <FormControl>
                <FormLabel>
                  <i className="fa-solid fa-plus"></i>
                  <i> Add list</i>
                </FormLabel>
                <Input
                  type="text"
                  placeholder="Choose a name for your new list"
                  value={newListTitle}
                  onChange={e => setNewListTitle(e.target.value)}
                  variant="filled"
                />
              </FormControl>
            </form>
          )}

        {lists.status === "fulfilled" ? (
          <>
            {lists.lists?.length === 1 ? (
              <div className={styles["no-lists"]}>No lists yet</div>
            ) : (
              <i>View list</i>
            )}

            {lists.lists?.map(list => makeList(list))}

            <Modal isOpen={isOpen} onClose={onClose} size={"xl"}>
              <ModalOverlay />
              {/* @ts-ignore */}
              <ModalContent className={styles["modal"]}>
                <ModalHeader>Delete List</ModalHeader>
                <ModalCloseButton />

                <ModalBody>
                  <i>
                    Are you sure you want to delete the list
                    <strong> {deletingList?.name}</strong>
                  </i>
                  <br />
                  <br />
                </ModalBody>

                <ModalFooter>
                  <Button
                    className={styles["submit-review"]}
                    colorScheme="red"
                    variant="outline"
                    mr={3}
                    onClick={dispatchDeleteList}
                  >
                    Delete List
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </>
        ) : (
          <>
            <div className="spinner">
              <Spinner size="xl" />
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
