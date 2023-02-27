import Navbar from "@/components/Navbar"

import { GetServerSideProps } from "next";
import axios from "axios";

export default function DetailsPage() {
  return <>
    <Navbar />
    Movie Details Page
  </>
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  console.log(context.query.movieId);
  return {
    props: {}
  }
}