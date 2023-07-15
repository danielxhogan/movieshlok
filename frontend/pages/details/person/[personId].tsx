import styles from "@/styles/PersonDetails.module.css";
import Navbar from "@/components/Navbar";
import List, { ListType } from "@/components/List";
import Footer from "@/components/Footer";

import { useDispatch } from "react-redux";
import { useAppSelector } from "@/redux/hooks";
import { getPersonDetails, PersonCredit } from "@/redux/actions/tmdb";
import { selectPersonDetails } from "@/redux/reducers/tmdb";

import { useState, useRef, useEffect, FormEvent } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Button, Select, Spinner } from "@chakra-ui/react";
import { reformatDate } from "@/utils/date";

const TMDB_IMAGE_URL = process.env.NEXT_PUBLIC_TMDB_IMAGE_URL;

export default function PersonDetailsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const personDetails = useAppSelector(selectPersonDetails);

  const [department, setDepartment] = useState<string>();
  const [departments, setDepartments] = useState<Set<string>>();
  const filter = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (typeof router.query.personId === "string") {
      dispatch<any>(getPersonDetails(router.query.personId));
    }
  }, [router.query.personId, dispatch]);

  useEffect(() => {
    if (typeof router.query.kf === "string") {
      setDepartment(router.query.kf);
    }
  }, [router.query.kf]);

  useEffect(() => {
    if (
      personDetails.status === "fulfilled" &&
      personDetails.success === true &&
      personDetails.details
    ) {
      let departmentsSet = new Set<string>();

      if (personDetails.details.credits.cast.length > 0) {
        departmentsSet.add("Acting");
      }

      personDetails.details.credits.crew.forEach(credit => {
        credit.department && departmentsSet.add(credit.department);
      });

      setDepartments(departmentsSet);
    }
  }, [personDetails]);

  function submitFilter(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDepartment(filter.current?.value);
  }

  function makeList(currentDepartment: string) {
    let movieList: PersonCredit[] = [];

    if (currentDepartment === "Acting") {
      movieList = personDetails.details
        ? [...personDetails.details.credits.cast]
        : [];
    } else {
      personDetails.details &&
        personDetails.details.credits.crew.forEach(credit => {
          if (credit.department === currentDepartment) {
            movieList.push(credit);
          }
        });
    }

    movieList.sort(
      (movie1: { popularity: number }, movie2: { popularity: number }) => {
        if (movie1.popularity < movie2.popularity) {
          return 1;
        }
        if (movie1.popularity > movie2.popularity) {
          return -1;
        }
        return 0;
      }
    );

    return <List listType={ListType.CREDITS} personCredits={movieList} />;
  }

  function makeOptions() {
    if (departments) {
      const departmentOptions: JSX.Element[] = [];

      departments.forEach(department => {
        departmentOptions.push(
          <option key={department} value={department}>
            {department}
          </option>
        );
      });
      return departmentOptions;
    }
  }

  return (
    <div className="wrapper">
      <Navbar />
      <div className="content">
        {personDetails.status === "fulfilled" ? (
          <div className={styles["person-details"]}>
            <div className={styles["person-image"]}>
              {personDetails.details?.profile_path && (
                <Image
                  src={`${TMDB_IMAGE_URL}/w342${personDetails.details.profile_path}`}
                  className={styles["profile-pic"]}
                  width={300}
                  height={500}
                  alt="backdrop"
                ></Image>
              )}
            </div>

            <div className={styles["person-data"]}>
              <div className={styles["title-section"]}>
                <div className={styles["title-left"]}>
                  {personDetails.details &&
                    personDetails.details.profile_path && (
                      <Image
                        src={`${TMDB_IMAGE_URL}/w342${personDetails.details.profile_path}`}
                        className={styles["title-profile-pic"]}
                        width={300}
                        height={500}
                        alt="backdrop"
                      ></Image>
                    )}
                </div>

                <div className={styles["title-right"]}>
                  <h1 className={styles["name"]}>
                    {personDetails.details?.name}
                  </h1>

                  <div className={styles["date"]}>
                    {personDetails.details &&
                      personDetails.details.birthday && (
                        <span>
                          {reformatDate(personDetails.details.birthday)} -{" "}
                        </span>
                      )}
                    {personDetails.details &&
                      personDetails.details.deathday && (
                        <span>
                          {reformatDate(personDetails.details.deathday)}
                        </span>
                      )}
                  </div>

                  <p className={styles["biography"]}>
                    {personDetails.details?.biography}
                  </p>
                </div>
              </div>

              <form
                onSubmit={e => submitFilter(e)}
                className={styles["filter-form"]}
              >
                {/* @ts-ignore */}
                <Button
                  className={styles["update-filter"]}
                  colorScheme="teal"
                  variant="outline"
                  type="submit"
                >
                  Update filter
                </Button>

                <Select
                  name="filter-select"
                  defaultValue={department}
                  ref={filter}
                >
                  {makeOptions()}
                </Select>
              </form>

              {department && makeList(department)}
            </div>
          </div>
        ) : (
          <>
            <div className="spinner">
              {/* @ts-ignore */}
              <Spinner size="xl" />
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
