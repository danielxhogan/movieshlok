import Navbar from "@/components/Navbar";
import List, { ListType } from "@/components/List";
import Footer from "@/components/Footer";

import { useDispatch } from "react-redux";
import { useAppSelector } from "@/redux/hooks";
import { getPersonDetails, PersonCredit } from "@/redux/actions/tmdb";
import { selectPersonDetails } from "@/redux/reducers/tmdb";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Spinner } from "@chakra-ui/react";

export default function PersonDetailsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const personDetails = useAppSelector(selectPersonDetails);

  const [department, setDepartment] = useState<string>();
  const [departments, setDepartments] = useState<Set<string>>();

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
      personDetails.credits
    ) {
      let departmentsSet = new Set<string>();

      if (personDetails.credits.cast.length > 0) {
        departmentsSet.add("Acting");
      }

      personDetails.credits.crew.forEach(credit => {
        credit.department && departmentsSet.add(credit.department);
      });

      setDepartments(departmentsSet);
    }
  }, [personDetails]);

  function makeList() {
    let movieList: PersonCredit[] = [];

    if (department === "Acting") {
      movieList = personDetails.credits ? personDetails.credits.cast : [];
    } else {
      personDetails.credits &&
        personDetails.credits.crew.forEach(credit => {
          if (credit.department === department) {
            movieList.push(credit);
          }
        });
    }

    return <List listType={ListType.CREDITS} personCredits={movieList} />;
  }

  return (
    <div className="wrapper">
      <Navbar />
      <div className="content">
        {personDetails.status === "fulfilled" ? (
          makeList()
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
