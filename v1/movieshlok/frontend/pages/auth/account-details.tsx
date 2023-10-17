import styles from "@/styles/auth/AccountDetailsPage.module.css";
import Navbar from "@/components/Navbar";

// import { GetServerSideProps } from "next";

export default function AccountDetailsPage() {
  return (
    <div className={styles["wrapper"]}>
      <Navbar />

      <div className={styles["account-details-page"]}>
        <h1>Account Details Page</h1>
      </div>
    </div>
  );
}

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   const cookies = context.req.headers.cookie;

//   if (cookies) {
//     const cookiesArray = cookies.split(";");
//     let username = null;
//     let authToken = null;
//     let refreshToken = null;

//     for (let i=0; i<cookiesArray.length; i++) {
//       const cookieName = cookiesArray[i].split("=")[0].trim();

//       switch (cookieName) {
//         case "username":
//           username = cookiesArray[i].split("=")[1];
//           break;
//         case "authToken":
//           authToken = cookiesArray[i].split("=")[1];
//           break;
//         case "refreshToken":
//           refreshToken = cookiesArray[i].split("=")[1];
//           break;
//       }
//     }

//     console.log(`username: ${username}`);
//     console.log(`authToken: ${authToken}`);
//     console.log(`refreshToken: ${refreshToken}`);

//     // get users notifications using authToken in header and username in where clause

//     // if errors try getting an auth token with refresh token and try notifications again

//     // if error redirect to login page

//     // if data populate react component with data
//   }

//   return {
//     props: {}
//   }
// }
